const pool = require('../db/connection');
const { analyzeCode } = require('../services/staticAnalyzer');
const { reviewWithAI } = require('../services/aiReviewer');

const submitReview = async (req, res) => {
  try {
    const { code, language, title, file_name } = req.body;
    if (!code || !language) return res.status(400).json({ error: 'Code and language are required' });
    if (code.length > 50000) return res.status(400).json({ error: 'Code too large (max 50KB)' });

    // Create review record with pending status
    const reviewRes = await pool.query(
      `INSERT INTO reviews (user_id, title, language, source_code, file_name, status)
       VALUES ($1,$2,$3,$4,$5,'processing') RETURNING *`,
      [req.user.id, title || `${language} Review`, language, code, file_name || null]
    );
    const review = reviewRes.rows[0];

    // Run static analysis
    const { findings: staticFindings, metrics } = analyzeCode(code, language);

    // Run AI review
    const aiResult = await reviewWithAI(code, language, staticFindings);

    // Combine all findings
    const allFindings = [
      ...staticFindings.map(f => ({ ...f, source: 'static' })),
      ...aiResult.findings.map(f => ({ ...f, source: 'ai' })),
    ];

    const criticalCount = allFindings.filter(f => f.severity === 'critical').length;
    const warningCount = allFindings.filter(f => f.severity === 'warning').length;
    const infoCount = allFindings.filter(f => f.severity === 'info').length;

    // Save findings to DB
    for (const f of allFindings) {
      await pool.query(
        `INSERT INTO review_findings (review_id, severity, category, issue, explanation, suggested_fix, file_name, line_number, code_snippet)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [review.id, f.severity, f.category || 'style', f.issue, f.explanation, f.suggested_fix, file_name || null, f.line_number || null, f.code_snippet || null]
      );
    }

    // Update review with results
    const updated = await pool.query(
      `UPDATE reviews SET
        overall_score=$1, summary=$2, total_issues=$3,
        critical_count=$4, warning_count=$5, info_count=$6,
        lines_of_code=$7, num_functions=$8, num_classes=$9,
        cyclomatic_complexity=$10, status='completed', updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [aiResult.overall_score, aiResult.summary, allFindings.length,
       criticalCount, warningCount, infoCount,
       metrics.linesOfCode, metrics.numFunctions, metrics.numClasses,
       metrics.cyclomaticComplexity, review.id]
    );

    res.status(201).json({
      review: updated.rows[0],
      findings: allFindings,
    });
  } catch (e) {
    console.error('Review error:', e);
    res.status(500).json({ error: e.message });
  }
};

const submitFileReview = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const code = req.file.buffer.toString('utf-8');
    const fileName = req.file.originalname;
    const ext = fileName.split('.').pop().toLowerCase();
    const langMap = { js: 'javascript', ts: 'typescript', py: 'python', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp', rb: 'ruby', go: 'go', php: 'php' };
    const language = langMap[ext] || 'javascript';

    req.body = { code, language, title: `Review: ${fileName}`, file_name: fileName };
    return submitReview(req, res);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getReviews = async (req, res) => {
  try {
    const { search, language, page = 1, limit = 10 } = req.query;
    let q = `SELECT id, title, language, file_name, overall_score, total_issues, critical_count, warning_count, info_count, status, created_at
             FROM reviews WHERE user_id=$1`;
    const params = [req.user.id];
    if (search) { params.push(`%${search}%`); q += ` AND (title ILIKE $${params.length} OR language ILIKE $${params.length})`; }
    if (language) { params.push(language); q += ` AND language=$${params.length}`; }
    q += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const r = await pool.query(q, params);
    const count = await pool.query('SELECT COUNT(*) FROM reviews WHERE user_id=$1', [req.user.id]);
    res.json({ reviews: r.rows, total: parseInt(count.rows[0].count), page: parseInt(page) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getReview = async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM reviews WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Review not found' });
    const findings = await pool.query('SELECT * FROM review_findings WHERE review_id=$1 ORDER BY severity DESC, line_number ASC', [req.params.id]);
    res.json({ review: r.rows[0], findings: findings.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteReview = async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM reviews WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const getStats = async (req, res) => {
  try {
    const [total, byLang, avgScore, recent] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, SUM(total_issues) as issues, SUM(critical_count) as critical FROM reviews WHERE user_id=$1', [req.user.id]),
      pool.query('SELECT language, COUNT(*) as count FROM reviews WHERE user_id=$1 GROUP BY language ORDER BY count DESC LIMIT 5', [req.user.id]),
      pool.query('SELECT AVG(overall_score) as avg FROM reviews WHERE user_id=$1 AND status=\'completed\'', [req.user.id]),
      pool.query('SELECT id,title,language,overall_score,created_at FROM reviews WHERE user_id=$1 ORDER BY created_at DESC LIMIT 5', [req.user.id]),
    ]);
    res.json({
      totalReviews: parseInt(total.rows[0].total),
      totalIssues: parseInt(total.rows[0].issues || 0),
      criticalIssues: parseInt(total.rows[0].critical || 0),
      avgScore: Math.round(parseFloat(avgScore.rows[0].avg || 0)),
      byLanguage: byLang.rows,
      recentReviews: recent.rows,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { submitReview, submitFileReview, getReviews, getReview, deleteReview, getStats };

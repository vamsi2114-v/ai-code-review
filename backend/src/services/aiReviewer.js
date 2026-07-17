// AI Code Reviewer using Groq API (Free)

const reviewWithAI = async (code, language, staticFindings) => {
  try {
    const staticSummary = staticFindings.slice(0, 10).map(f =>
      `- [${f.severity.toUpperCase()}] Line ${f.line_number || '?'}: ${f.issue}`
    ).join('\n');

    const prompt = `You are an expert code reviewer. Review the following ${language} code and provide detailed, actionable feedback.

CODE TO REVIEW:
\`\`\`${language}
${code.substring(0, 3000)}
\`\`\`

STATIC ANALYSIS ALREADY FOUND:
${staticSummary || 'No static issues found'}

Provide your review as a JSON object with this exact structure:
{
  "overall_score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "findings": [
    {
      "severity": "<critical|warning|info>",
      "category": "<bug|security|performance|style|documentation>",
      "issue": "<short issue title>",
      "explanation": "<detailed explanation>",
      "suggested_fix": "<specific fix or improved code>",
      "line_number": <number or null>
    }
  ]
}

Focus on:
1. Bugs and logic errors NOT already identified
2. Security vulnerabilities
3. Performance issues
4. Code architecture and design patterns
5. Missing error handling
6. Code readability and maintainability

Return ONLY the JSON, no other text.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error: ${err}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content.trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const result = JSON.parse(jsonMatch[0]);
    return {
      overall_score: result.overall_score || 70,
      summary: result.summary || 'Code review completed.',
      findings: (result.findings || []).map(f => ({
        severity: f.severity || 'info',
        category: f.category || 'style',
        issue: f.issue || 'Unknown issue',
        explanation: f.explanation || '',
        suggested_fix: f.suggested_fix || '',
        line_number: f.line_number || null,
        code_snippet: null,
      })),
    };
  } catch (error) {
    console.error('AI review error:', error.message);
    return {
      overall_score: 65,
      summary: 'Static analysis completed. AI review unavailable — check your GROQ_API_KEY in .env file.',
      findings: [{
        severity: 'info',
        category: 'documentation',
        issue: 'AI review unavailable',
        explanation: 'Configure GROQ_API_KEY in your backend/.env file to enable AI-powered reviews.',
        suggested_fix: 'Add GROQ_API_KEY=gsk_xxxx to backend/.env',
        line_number: null,
        code_snippet: null,
      }],
    };
  }
};

module.exports = { reviewWithAI };
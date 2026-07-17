'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [review, setReview] = useState<any>(null)
  const [findings, setFindings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [category, setCategory] = useState('all')
  const [showCode, setShowCode] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : ''

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return }
    axios.get(`${API}/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setReview(r.data.review); setFindings(r.data.findings) })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  const filtered = findings.filter(f => {
    if (filter !== 'all' && f.severity !== filter) return false
    if (category !== 'all' && f.category !== category) return false
    return true
  })

  const scoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'
  const scoreLabel = (s: number) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Needs Work' : 'Poor'

  const severityIcon = (s: string) => s === 'critical' ? '🚨' : s === 'warning' ? '⚠️' : 'ℹ️'
  const categoryIcon = (c: string) => ({ bug: '🐛', security: '🔒', performance: '⚡', style: '🎨', documentation: '📝' }[c] || '📌')

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <div style={{ color: '#64748b' }}>Loading review...</div>
      </div>
    </div>
  )

  if (!review) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2d3148', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16 }}>CodeReview AI</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/new-review"><button className="btn-primary">+ New Review</button></Link>
          <Link href="/dashboard"><button className="btn-ghost">← Dashboard</button></Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{review.title}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="badge-lang">{review.language}</span>
              {review.file_name && <span style={{ color: '#475569', fontSize: 13 }}>📄 {review.file_name}</span>}
              <span style={{ color: '#475569', fontSize: 13 }}>{new Date(review.created_at).toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => setShowCode(!showCode)} className="btn-ghost">
            {showCode ? 'Hide Code' : 'View Code'}
          </button>
        </div>

        {/* Source code toggle */}
        {showCode && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #2d3148', color: '#64748b', fontSize: 13, background: '#1a1d27' }}>
              Source Code · {review.lines_of_code} lines
            </div>
            <pre style={{ background: '#0d1117', padding: 20, overflow: 'auto', maxHeight: 400, margin: 0, fontSize: 13, lineHeight: 1.6, color: '#e2e8f0', fontFamily: 'Consolas, Monaco, monospace' }}>
              {review.source_code}
            </pre>
          </div>
        )}

        {/* Score + Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ color: scoreColor(review.overall_score), fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{review.overall_score}</div>
            <div style={{ color: scoreColor(review.overall_score), fontSize: 14, fontWeight: 600, marginTop: 4 }}>{scoreLabel(review.overall_score)}</div>
            <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Overall Score</div>
            <div style={{ height: 1, background: '#2d3148', margin: '16px 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div><div style={{ color: '#ef4444', fontSize: 18, fontWeight: 700 }}>{review.critical_count}</div><div style={{ color: '#475569', fontSize: 10 }}>Critical</div></div>
              <div><div style={{ color: '#f59e0b', fontSize: 18, fontWeight: 700 }}>{review.warning_count}</div><div style={{ color: '#475569', fontSize: 10 }}>Warning</div></div>
              <div><div style={{ color: '#3b82f6', fontSize: 18, fontWeight: 700 }}>{review.info_count}</div><div style={{ color: '#475569', fontSize: 10 }}>Info</div></div>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: 20, marginBottom: 12 }}>
              <div style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>AI Summary</div>
              <div style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.7 }}>{review.summary}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Lines of Code', value: review.lines_of_code, icon: '📏' },
                { label: 'Functions', value: review.num_functions, icon: '🔧' },
                { label: 'Classes', value: review.num_classes, icon: '🏗️' },
                { label: 'Complexity', value: review.cyclomatic_complexity, icon: '🌀' },
              ].map(m => (
                <div key={m.label} className="card" style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700 }}>{m.value}</div>
                  <div style={{ color: '#475569', fontSize: 11 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Findings */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>
              Issues Found <span style={{ color: '#475569', fontWeight: 400 }}>({filtered.length} of {findings.length})</span>
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'critical', 'warning', 'info'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                    background: filter === s ? (s === 'critical' ? '#7f1d1d' : s === 'warning' ? '#451a03' : s === 'info' ? '#1e3a5f' : '#1e3a5f') : 'transparent',
                    borderColor: filter === s ? (s === 'critical' ? '#ef4444' : s === 'warning' ? '#f59e0b' : s === 'info' ? '#3b82f6' : '#3b82f6') : '#2d3148',
                    color: filter === s ? (s === 'critical' ? '#fca5a5' : s === 'warning' ? '#fcd34d' : '#93c5fd') : '#64748b' }}>
                  {s === 'all' ? `All (${findings.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${findings.filter(f => f.severity === s).length})`}
                </button>
              ))}
              <select onChange={e => setCategory(e.target.value)} value={category}
                style={{ background: '#0d1117', border: '1px solid #2d3148', color: '#94a3b8', padding: '5px 10px', borderRadius: 6, fontSize: 12 }}>
                <option value="all">All Categories</option>
                {['bug', 'security', 'performance', 'style', 'documentation'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              No issues found for this filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((f, i) => (
                <FindingCard key={f.id || i} finding={f} severityIcon={severityIcon} categoryIcon={categoryIcon} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FindingCard({ finding: f, severityIcon, categoryIcon }: any) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = f.severity === 'critical' ? '#ef4444' : f.severity === 'warning' ? '#f59e0b' : '#3b82f6'

  return (
    <div style={{ background: '#0d1117', border: `1px solid ${borderColor}22`, borderLeft: `3px solid ${borderColor}`, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <span style={{ fontSize: 18 }}>{severityIcon(f.severity)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{f.issue}</span>
            <span className={`badge-${f.severity}`}>{f.severity}</span>
            {f.category && <span style={{ color: '#475569', fontSize: 12 }}>{categoryIcon(f.category)} {f.category}</span>}
          </div>
          {f.line_number && <span style={{ color: '#475569', fontSize: 12 }}>Line {f.line_number}</span>}
        </div>
        <span style={{ color: '#475569', fontSize: 16 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #1e2a3a', padding: '16px 20px' }}>
          {f.code_snippet && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 6 }}>Code</div>
              <pre style={{ background: '#0a0e1a', padding: '10px 14px', borderRadius: 6, fontSize: 12, color: '#fca5a5', overflow: 'auto', margin: 0, fontFamily: 'Consolas, Monaco, monospace' }}>
                {f.code_snippet}
              </pre>
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Explanation</div>
            <div style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>{f.explanation}</div>
          </div>
          {f.suggested_fix && (
            <div style={{ background: '#0a1a0a', border: '1px solid #16a34a33', borderRadius: 6, padding: '12px 14px' }}>
              <div style={{ color: '#4ade80', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>✅ Suggested Fix</div>
              <pre style={{ color: '#86efac', fontSize: 12, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'Consolas, Monaco, monospace', lineHeight: 1.6 }}>
                {f.suggested_fix}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

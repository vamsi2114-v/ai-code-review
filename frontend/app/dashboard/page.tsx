'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState('')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : ''

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return }
    const u = localStorage.getItem('cr_user')
    if (u) setUser(JSON.parse(u))
    fetchData()
  }, [])

  useEffect(() => { if (token) fetchReviews() }, [search, lang])

  const fetchData = async () => {
    try {
      const [statsRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/reviews/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/reviews`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setStats(statsRes.data)
      setReviews(reviewsRes.data.reviews)
    } catch { router.push('/auth/login') }
    finally { setLoading(false) }
  }

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, language: lang || undefined }
      })
      setReviews(res.data.reviews)
    } catch {}
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return
    await axios.delete(`${API}/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    setReviews(r => r.filter(x => x.id !== id))
  }

  const logout = () => { localStorage.clear(); router.push('/auth/login') }

  const scoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'

  const langColors: Record<string, string> = {
    javascript: '#f7df1e', typescript: '#3178c6', python: '#3776ab',
    java: '#ed8b00', cpp: '#00599c', csharp: '#239120',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2d3148', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16 }}>CodeReview AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/new-review">
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>+</span> New Review
            </button>
          </Link>
          <Link href="/profile">
            <div style={{ width: 34, height: 34, background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </Link>
          <button onClick={logout} className="btn-ghost" style={{ padding: '6px 14px' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0' }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Here's an overview of your code reviews</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total Reviews', value: stats.totalReviews, icon: '📋', color: '#3b82f6' },
              { label: 'Avg Score', value: `${stats.avgScore}/100`, icon: '⭐', color: '#10b981' },
              { label: 'Total Issues', value: stats.totalIssues, icon: '🐛', color: '#f59e0b' },
              { label: 'Critical Issues', value: stats.criticalIssues, icon: '🚨', color: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ color: s.color, fontSize: 28, fontWeight: 700 }}>{s.value}</div>
                  </div>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters + Reviews */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>Review History</h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="input" style={{ width: 220 }} placeholder="Search reviews..."
                value={search} onChange={e => setSearch(e.target.value)} />
              <select className="input" style={{ width: 140 }} value={lang} onChange={e => setLang(e.target.value)}>
                <option value="">All Languages</option>
                {['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ color: '#64748b', fontSize: 16, marginBottom: 20 }}>No reviews yet</div>
              <Link href="/new-review">
                <button className="btn-primary">Start your first review</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#0d1117', borderRadius: 8, border: '1px solid #2d3148', cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2d3148'}
                  onClick={() => router.push(`/review/${r.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: '#1a1d27', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {r.language === 'python' ? '🐍' : r.language === 'java' ? '☕' : r.language?.includes('type') ? '🔷' : '📄'}
                    </div>
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                        <span className="badge-lang">{r.language}</span>
                        {r.file_name && <span style={{ color: '#475569', fontSize: 12 }}>{r.file_name}</span>}
                        <span style={{ color: '#475569', fontSize: 12 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: scoreColor(r.overall_score), fontSize: 20, fontWeight: 700 }}>{r.overall_score}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>score</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#ef4444', fontSize: 16, fontWeight: 700 }}>{r.critical_count}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>critical</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#f59e0b', fontSize: 16, fontWeight: 700 }}>{r.warning_count}</div>
                      <div style={{ color: '#475569', fontSize: 11 }}>warnings</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteReview(r.id) }}
                      style={{ background: 'transparent', border: '1px solid #7f1d1d', color: '#ef4444', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

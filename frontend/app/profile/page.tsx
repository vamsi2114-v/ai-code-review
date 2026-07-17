'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ name: '', bio: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [pwdLoading, setPwdLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('cr_token') : ''

  useEffect(() => {
    if (!token) { router.push('/auth/login'); return }
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setUser(r.data); setForm({ name: r.data.name, bio: r.data.bio || '' }) })
      .catch(() => router.push('/auth/login'))
  }, [])

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setMsg(''); setErr('')
    try {
      const r = await axios.put(`${API}/auth/profile`, form, { headers: { Authorization: `Bearer ${token}` } })
      setUser(r.data)
      localStorage.setItem('cr_user', JSON.stringify(r.data))
      setMsg('Profile updated successfully!')
    } catch (e: any) { setErr(e.response?.data?.error || 'Failed to update') }
    finally { setLoading(false) }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirm) { setPwdErr('Passwords do not match'); return }
    if (pwdForm.newPassword.length < 6) { setPwdErr('Password must be at least 6 characters'); return }
    setPwdLoading(true); setPwdMsg(''); setPwdErr('')
    try {
      await axios.put(`${API}/auth/change-password`, { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }, { headers: { Authorization: `Bearer ${token}` } })
      setPwdMsg('Password changed successfully!')
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (e: any) { setPwdErr(e.response?.data?.error || 'Failed to change password') }
    finally { setPwdLoading(false) }
  }

  const logout = () => { localStorage.clear(); router.push('/auth/login') }

  if (!user) return <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2d3148', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16 }}>CodeReview AI</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard"><button className="btn-ghost">← Dashboard</button></Link>
          <button onClick={logout} className="btn-ghost">Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 28 }}>Profile Settings</h1>

        {/* Avatar + info */}
        <div className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 24 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 18 }}>{user.name}</div>
            <div style={{ color: '#64748b', fontSize: 14 }}>{user.email}</div>
            <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Joined {new Date(user.created_at).toLocaleDateString()}</div>
          </div>
        </div>

        {/* Update profile */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 20 }}>Update Profile</h2>
          {msg && <div style={{ background: '#052e16', border: '1px solid #16a34a', color: '#4ade80', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{msg}</div>}
          {err && <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{err}</div>}
          <form onSubmit={updateProfile}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Bio</label>
              <textarea className="input" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about yourself..." style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Change password */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 20 }}>Change Password</h2>
          {pwdMsg && <div style={{ background: '#052e16', border: '1px solid #16a34a', color: '#4ade80', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{pwdMsg}</div>}
          {pwdErr && <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{pwdErr}</div>}
          <form onSubmit={changePassword}>
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
              { label: 'Confirm New Password', key: 'confirm' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                <input className="input" type="password" value={(pwdForm as any)[f.key]}
                  onChange={e => setPwdForm({ ...pwdForm, [f.key]: e.target.value })} required />
              </div>
            ))}
            <button type="submit" className="btn-primary" disabled={pwdLoading}>{pwdLoading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

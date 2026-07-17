'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    try {
      const res = await axios.post(`${API}/auth/register`, { name: form.name, email: form.email, password: form.password })
      localStorage.setItem('cr_token', res.data.token)
      localStorage.setItem('cr_user', JSON.stringify(res.data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>CodeReview AI</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14 }}>Create your account</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {error && <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 6, marginBottom: 20, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
              { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>{f.label}</label>
                <input className="input" type={f.type} value={(form as any)[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
              </div>
            ))}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px 0', marginTop: 8 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 14 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

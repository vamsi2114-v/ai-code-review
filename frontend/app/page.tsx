'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('cr_token')
    router.push(token ? '/dashboard' : '/auth/login')
  }, [router])
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f1117' }}>
      <div style={{ color: '#64748b' }}>Loading...</div>
    </div>
  )
}

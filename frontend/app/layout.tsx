import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Code Review Assistant',
  description: 'Automated code review powered by AI and static analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

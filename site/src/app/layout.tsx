import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Anti-Gravity AI Digest',
  description: 'Daily AI news, curated and summarized by Claude',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

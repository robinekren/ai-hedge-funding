import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Hedge Funding — Dashboard',
  description: 'The World\'s Most Autonomous AI-Driven Hedge Fund',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-terminal-bg text-terminal-text font-mono antialiased">
        {children}
      </body>
    </html>
  )
}

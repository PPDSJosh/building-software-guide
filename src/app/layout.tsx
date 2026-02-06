import type { Metadata } from 'next'
import { ChromeBar } from '@/components/ui/ChromeBar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Building Software with Claude Code — A Guide for Non-Engineers',
  description: 'A comprehensive guide by Josh Bull on building real software using Claude Code, designed for non-engineers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ChromeBar />
        <main
          className="relative"
          style={{ paddingTop: 'var(--chrome-height)' }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}

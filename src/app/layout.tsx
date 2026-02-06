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
        <a
          href="#hero"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
        >
          Skip to content
        </a>
        <ChromeBar />
        <main
          role="main"
          className="relative"
          style={{ paddingTop: 'var(--chrome-height)' }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}

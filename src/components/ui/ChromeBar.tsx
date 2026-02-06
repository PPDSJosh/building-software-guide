'use client'

export function ChromeBar() {
  return (
    <header
      role="banner"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-8"
      style={{
        height: 'var(--chrome-height)',
        backgroundColor: 'var(--chrome-bg)',
        color: 'var(--chrome-text)',
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        letterSpacing: '0.04em',
      }}
    >
      <nav aria-label="Site identity">
        <span className="font-medium tracking-wider uppercase">
          Passionate Pursuit Design Studio
        </span>
      </nav>

      <span className="hidden md:block text-center opacity-70" aria-label="Guide title">
        Building Software with Claude Code
      </span>

      <span className="opacity-70" aria-label="Studio website">
        ppds.studio
      </span>
    </header>
  )
}

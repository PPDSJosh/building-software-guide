'use client'

interface BodyTextProps {
  children: React.ReactNode
  className?: string
}

/**
 * BodyText — standard body copy paragraph.
 *
 * PP Neue Montreal, 20px desktop / 18px mobile, line height 1.7,
 * max width 680px (~65-75 characters per line).
 */
export function BodyText({ children, className = '' }: BodyTextProps) {
  return (
    <p
      className={`mb-6 last:mb-0 ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'clamp(18px, 2vw, 22px)',
        lineHeight: 1.7,
        maxWidth: 'var(--body-max-width)',
        overflowWrap: 'break-word',
      }}
    >
      {children}
    </p>
  )
}

interface BoldTermProps {
  children: React.ReactNode
}

/**
 * BoldTerm — inline bold term with slight emphasis.
 * For defining technical terms inline within BodyText.
 */
export function BoldTerm({ children }: BoldTermProps) {
  return (
    <strong style={{ fontWeight: 500 }}>
      {children}
    </strong>
  )
}

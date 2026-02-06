'use client'

import { forwardRef } from 'react'
import type { DisplayFont } from '@/lib/data/sections'

interface DisplayTypeProps {
  /** The text to display */
  text: string
  /** Which display font to use */
  font: DisplayFont
  /** Additional CSS class names */
  className?: string
  /** Whether to apply gradient-through-letterforms effect */
  gradientMask?: boolean
  /** Split text into lines — each line becomes a separate element for parallax */
  lines?: string[]
}

/**
 * Font family CSS values for each display font.
 */
const FONT_STYLES: Record<DisplayFont, { fontFamily: string; letterSpacing: string; lineHeight: string }> = {
  tusker: {
    fontFamily: 'var(--font-tusker)',
    letterSpacing: '-0.03em',
    lineHeight: '0.88',
  },
  'bt-super': {
    fontFamily: 'var(--font-bt-super)',
    letterSpacing: '0',
    lineHeight: '0.92',
  },
  bulevar: {
    fontFamily: 'var(--font-bulevar-poster)',
    letterSpacing: '0',
    lineHeight: '0.95',
  },
}

/**
 * DisplayType — renders display-scale typography for TAKEOVER moments.
 *
 * Supports the three rotating display fonts (Tusker, BT Super Eighty, Bulevar Poster)
 * at massive scale (60-85vw). Optionally applies gradient-through-letterforms effect
 * using CSS background-clip: text with a WebGL gradient behind it.
 *
 * When `lines` is provided, each line is rendered as a separate div
 * that can be individually targeted for parallax and assembly animation.
 */
export const DisplayType = forwardRef<HTMLDivElement, DisplayTypeProps>(function DisplayType(
  { text, font, className = '', gradientMask = false, lines },
  ref,
) {
  const fontStyle = FONT_STYLES[font]
  const textCase = font === 'bulevar' ? '' : 'uppercase'

  if (lines && lines.length > 0) {
    return (
      <div ref={ref} className={`${textCase} text-center ${className}`}>
        {lines.map((line, i) => (
          <div
            key={i}
            data-takeover-line={i}
            className="takeover-line"
            style={{
              fontFamily: fontStyle.fontFamily,
              fontSize: 'clamp(48px, 15vw, 200px)',
              letterSpacing: fontStyle.letterSpacing,
              lineHeight: fontStyle.lineHeight,
              ...(gradientMask
                ? {
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '100% 100%',
                  }
                : {}),
            }}
          >
            {line}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={`${textCase} text-center ${className}`}
      style={{
        fontFamily: fontStyle.fontFamily,
        fontSize: 'clamp(48px, 15vw, 200px)',
        letterSpacing: fontStyle.letterSpacing,
        lineHeight: fontStyle.lineHeight,
        ...(gradientMask
          ? {
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '100% 100%',
            }
          : {}),
      }}
    >
      {text}
    </div>
  )
})

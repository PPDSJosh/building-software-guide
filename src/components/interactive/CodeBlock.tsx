'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

interface CodeBlockProps {
  /** Code content */
  code: string
  /** Language label shown above the block */
  language?: string
  /** Caption below the block */
  caption?: string
  /** Background color — defaults to section deepest */
  bgColor?: string
  /** Left border accent color — defaults to section bright */
  accentColor?: string
  className?: string
}

/**
 * CodeBlock — formatted code display for INTERACTIVE treatment.
 *
 * Spec requirements:
 * - Background: Deepest/Dark stops from section's base family
 * - Syntax: Muted tones from base and secondary families (not neon)
 * - Border: Subtle left border or top accent in section gradient color
 * - Corners: 8-12px rounded
 * - Padding: 24-32px
 * - Font: Monospace 16-18px, line height 1.5-1.6em, 2-space tabs
 *
 * Motion: Depth emergence — scale 95% → 100%, triggered not scrubbed.
 */
export function CodeBlock({
  code,
  language,
  caption,
  bgColor = 'var(--gold-deepest, #592D11)',
  accentColor = 'var(--gold-bright, #DCA14C)',
  className = '',
}: CodeBlockProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    gsap.fromTo(
      el,
      { y: 16, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      },
    )

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === el)
        .forEach((st) => st.kill())
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {language && (
        <p
          className="text-xs uppercase tracking-widest mb-2 opacity-40"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {language}
        </p>
      )}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: bgColor,
          borderRadius: '10px',
          borderLeft: `3px solid ${accentColor}`,
        }}
      >
        <pre
          role="region"
          aria-label={language ? `${language} code example` : 'Code example'}
          className="overflow-x-auto"
          style={{
            padding: '24px 28px',
            fontFamily: 'var(--font-mono)',
            fontSize: '16px',
            lineHeight: 1.55,
            tabSize: 2,
            color: 'var(--white)',
          }}
        >
          <code>{code}</code>
        </pre>
      </div>
      {caption && (
        <p
          className="mt-3 text-sm opacity-50"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {caption}
        </p>
      )}
    </div>
  )
}

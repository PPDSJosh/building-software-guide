'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface RevealProps {
  /** The headline text */
  text: string
  /** Section ID for URL hash */
  id?: string
  /** Content zone */
  zone?: 'wide' | 'full'
  /** Override font family (default: Canela Thin) */
  fontFamily?: string
  /** Override font size (default: clamp(32px, 7vw, 96px)) */
  fontSize?: string
  className?: string
  /** Semantic heading level. Default: h2 */
  headingLevel?: 'h2' | 'h3'
}

/**
 * Reveal — a large-scale typographic moment.
 *
 * Not full-viewport like TAKEOVER, but a significant beat.
 * Canela Thin at headline scale (6-10vw). Marks transitions,
 * sets up what comes next.
 *
 * Motion: Triggered entrance, 800-1200ms, NOT scrub-driven.
 * The text fades in and rises — a quiet, confident arrival.
 *
 * Spec:
 * - Typography: Canela Thin at headline scale
 * - Scroll budget: 1-1.5vh
 * - Gradient expression: 2-3 stops from base family plus one neighbor
 * - Layout: Centered in wide or full-bleed zone
 */
export function Reveal({ text, id, zone = 'wide', fontFamily, fontSize, className = '', headingLevel = 'h2' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
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
    <section
      id={id}
      data-treatment="REVEAL"
      className={`py-24 md:py-32 ${className}`}
    >
      <GridContainer>
        <ContentZone zone={zone}>
          {(() => {
            const HeadingTag = headingLevel
            return (
              <div ref={ref} className="text-center">
                <HeadingTag
                  style={{
                    fontFamily: fontFamily ?? 'var(--font-canela)',
                    fontWeight: fontFamily ? 400 : 100,
                    fontSize: fontSize ?? 'clamp(32px, 7vw, 96px)',
                    lineHeight: 1.1,
                  }}
                >
                  {text}
                </HeadingTag>
              </div>
            )
          })()}
        </ContentZone>
      </GridContainer>
    </section>
  )
}

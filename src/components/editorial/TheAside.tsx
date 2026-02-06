'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface TheAsideProps {
  /** Main body content */
  body: React.ReactNode
  /** Margin annotation content */
  aside: React.ReactNode
  /** Position of the aside */
  asidePosition?: 'left' | 'right'
  className?: string
}

/**
 * The Aside — body copy with a margin annotation.
 *
 * Medium column (8-col, ~920px). Body takes ~65%, aside takes ~35%.
 * Aside is a smaller, supporting piece of content (annotation, note, reference).
 * Aside enters with a slight delay after the body.
 */
export function TheAside({ body, aside, asidePosition = 'right', className = '' }: TheAsideProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container || prefersReduced) return

    const bodyEl = container.querySelector('[data-aside-body]')
    const asideEl = container.querySelector('[data-aside-note]')

    if (bodyEl) {
      gsap.fromTo(
        bodyEl,
        { y: 20, opacity: 0.8 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    }

    if (asideEl) {
      gsap.fromTo(
        asideEl,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          delay: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      )
    }

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === container)
        .forEach((st) => st.kill())
    }
  }, [])

  const isRight = asidePosition === 'right'

  return (
    <GridContainer>
      <ContentZone zone="medium">
        <div
          ref={containerRef}
          className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 ${className}`}
          style={{ direction: isRight ? 'ltr' : 'rtl' }}
        >
          <div data-aside-body style={{ direction: 'ltr', maxWidth: 'var(--body-max-width)' }}>
            {body}
          </div>
          <div
            data-aside-note
            className="md:w-[240px] opacity-60 text-sm"
            style={{
              direction: 'ltr',
              fontFamily: 'var(--font-body)',
              lineHeight: 1.5,
              borderLeft: isRight ? '1px solid rgba(255,255,255,0.1)' : 'none',
              borderRight: isRight ? 'none' : '1px solid rgba(255,255,255,0.1)',
              paddingLeft: isRight ? '16px' : '0',
              paddingRight: isRight ? '0' : '16px',
            }}
          >
            {aside}
          </div>
        </div>
      </ContentZone>
    </GridContainer>
  )
}

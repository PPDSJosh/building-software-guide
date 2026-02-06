'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface TheCinematicProps {
  children: React.ReactNode
  className?: string
}

/**
 * The Cinematic — large centered statement.
 *
 * A dramatic typographic moment within editorial flow. Larger type (28-32px),
 * wide column, centered. Used for key insights or emotional beats.
 *
 * Not as intense as a REVEAL, but breaks the reading rhythm with emphasis.
 * Typically uses Canela Thin or PP Neue Montreal at larger size.
 */
export function TheCinematic({ children, className = '' }: TheCinematicProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    gsap.fromTo(
      el,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.8,
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
    <GridContainer>
      <ContentZone zone="wide">
        <div
          ref={ref}
          className={`py-24 md:py-32 text-center ${className}`}
          style={{
            fontSize: 'clamp(28px, 4vw, 32px)',
            lineHeight: 1.3,
          }}
        >
          {children}
        </div>
      </ContentZone>
    </GridContainer>
  )
}

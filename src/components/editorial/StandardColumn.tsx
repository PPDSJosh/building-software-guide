'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface StandardColumnProps {
  children: React.ReactNode
  className?: string
}

/**
 * Standard Column — the default editorial layout.
 *
 * 6-col (narrow, ~680px), centered. Body copy left-justified within.
 * The workhorse of the guide — where most sustained reading happens.
 *
 * Motion: Triggered entrance — translateY: 20px → 0, opacity: 0.8 → 1.0,
 * duration: 1.5s, ease: power2.out
 */
export function StandardColumn({ children, className = '' }: StandardColumnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    gsap.fromTo(
      el,
      { y: 20, opacity: 0.8 },
      {
        y: 0,
        opacity: 1,
        duration: 1.5,
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
    <GridContainer>
      <ContentZone zone="narrow">
        <div ref={ref} className={className}>
          {children}
        </div>
      </ContentZone>
    </GridContainer>
  )
}

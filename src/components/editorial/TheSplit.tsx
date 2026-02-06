'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface TheSplitProps {
  /** Left column content */
  left: React.ReactNode
  /** Right column content */
  right: React.ReactNode
  /** Stagger delay between columns (seconds) */
  stagger?: number
  className?: string
}

/**
 * The Split — side-by-side layout with stagger.
 *
 * Medium column (8-col, ~920px), two equal halves.
 * Left column enters slightly before right.
 * Each block left-justified internally, pair centered as a unit.
 */
export function TheSplit({ left, right, stagger = 0.15, className = '' }: TheSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container || prefersReduced) return

    const cols = container.querySelectorAll('[data-split-col]')

    gsap.fromTo(
      cols,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      },
    )

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === container)
        .forEach((st) => st.kill())
    }
  }, [stagger])

  return (
    <GridContainer>
      <ContentZone zone="medium">
        <div ref={containerRef} className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 ${className}`}>
          <div data-split-col className="md:border-r md:border-dotted md:border-white/10 md:pr-12">{left}</div>
          <div data-split-col>{right}</div>
        </div>
      </ContentZone>
    </GridContainer>
  )
}

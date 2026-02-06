'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface WideArgumentProps {
  /** Three columns of content */
  columns: [React.ReactNode, React.ReactNode, React.ReactNode]
  className?: string
}

/**
 * Wide Argument — 3-column layout within 10-col wide zone.
 *
 * For presenting three related ideas, comparisons, or parallel concepts.
 * Each column enters with stagger. All three centered as a unit.
 */
export function WideArgument({ columns, className = '' }: WideArgumentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container || prefersReduced) return

    const cols = container.querySelectorAll('[data-wide-col]')

    gsap.fromTo(
      cols,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.12,
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
  }, [])

  return (
    <GridContainer>
      <ContentZone zone="wide">
        <div ref={containerRef} className={`grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 ${className}`}>
          {columns.map((col, i) => (
            <div
              key={i}
              data-wide-col
              className={i < columns.length - 1 ? 'md:border-r md:border-dotted md:border-white/10 md:pr-10' : ''}
            >
              {col}
            </div>
          ))}
        </div>
      </ContentZone>
    </GridContainer>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface TheInsetProps {
  children: React.ReactNode
  /** Content zone width */
  zone?: 'narrow' | 'medium' | 'wide'
  className?: string
}

/**
 * The Inset — centered break element within text flow.
 *
 * A visual interruption in the reading flow — a diagram, illustration,
 * blockquote, or important callout that breaks the column rhythm.
 * Enters with a subtle scale-up from 95% to 100%.
 */
export function TheInset({ children, zone = 'medium', className = '' }: TheInsetProps) {
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
    <GridContainer>
      <ContentZone zone={zone}>
        <div ref={ref} className={`py-8 ${className}`}>
          {children}
        </div>
      </ContentZone>
    </GridContainer>
  )
}

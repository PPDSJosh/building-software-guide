'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import type { TreatmentLevel } from '@/lib/data/sections'

interface SectionProps {
  /** Unique section ID for URL hash and ScrollTrigger */
  id: string
  /** Treatment level — determines visual behavior */
  treatment: TreatmentLevel
  /** Additional CSS class names */
  className?: string
  /** Children content */
  children: React.ReactNode
}

/**
 * Section — the fundamental building block of the guide.
 *
 * Each section registers itself with GSAP ScrollTrigger for:
 * 1. URL hash updates when section enters viewport center
 * 2. Section-enter/leave events for gradient transitions
 *
 * Treatment levels control the visual intensity:
 * - TAKEOVER: Full-viewport pinned scroll, display type, max gradient expression
 * - REVEAL: Large typographic moment, triggered entrance animation
 * - EDITORIAL: Calm body copy, minimal motion, reading focus
 * - INTERACTIVE: Code blocks, cards, prompted elements
 * - BREATH: Pure gradient crossfade, no content
 */
export function Section({ id, treatment, className = '', children }: SectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    // Register ScrollTrigger for URL hash updates
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        if (window.location.hash !== `#${id}`) {
          history.replaceState(null, '', `#${id}`)
        }
      },
      onEnterBack: () => {
        if (window.location.hash !== `#${id}`) {
          history.replaceState(null, '', `#${id}`)
        }
      },
    })

    return () => {
      trigger.kill()
    }
  }, [id])

  // Treatment-specific default classes
  const treatmentClasses: Record<TreatmentLevel, string> = {
    TAKEOVER: 'relative min-h-screen',
    REVEAL: 'relative py-24 md:py-32',
    EDITORIAL: 'relative py-16 md:py-24',
    INTERACTIVE: 'relative py-12 md:py-16',
    BREATH: 'relative',
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label={id.replace(/-/g, ' ')}
      data-treatment={treatment}
      className={`${treatmentClasses[treatment]} ${className}`}
      style={{
        contentVisibility: treatment === 'EDITORIAL' || treatment === 'INTERACTIVE' ? 'auto' : undefined,
        containIntrinsicSize: treatment === 'EDITORIAL' || treatment === 'INTERACTIVE' ? 'auto 500px' : undefined,
      }}
    >
      {children}
    </section>
  )
}

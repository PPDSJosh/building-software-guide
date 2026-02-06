'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GridContainer, ContentZone } from '@/components/ui/Grid'

interface CodeCompanionProps {
  /** Text explanation */
  text: React.ReactNode
  /** Code block content */
  code: React.ReactNode
  /** Which side the code appears on */
  codePosition?: 'left' | 'right'
  className?: string
}

/**
 * Code Companion — text and code side by side.
 *
 * Medium column (8-col, ~920px). Text on one side, code on the other.
 * Code block uses the section's deepest/dark colors for background.
 * Pair centered, each block left-justified internally.
 */
export function CodeCompanion({ text, code, codePosition = 'right', className = '' }: CodeCompanionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container || prefersReduced) return

    const textEl = container.querySelector('[data-cc-text]')
    const codeEl = container.querySelector('[data-cc-code]')

    if (textEl) {
      gsap.fromTo(
        textEl,
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

    if (codeEl) {
      gsap.fromTo(
        codeEl,
        { y: 16, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          delay: 0.15,
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

  const isCodeRight = codePosition === 'right'

  return (
    <GridContainer>
      <ContentZone zone="medium">
        <div
          ref={containerRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start ${className}`}
        >
          {isCodeRight ? (
            <>
              <div data-cc-text>{text}</div>
              <div data-cc-code>{code}</div>
            </>
          ) : (
            <>
              <div data-cc-code>{code}</div>
              <div data-cc-text>{text}</div>
            </>
          )}
        </div>
      </ContentZone>
    </GridContainer>
  )
}

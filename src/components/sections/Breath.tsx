'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { GradientPlane, EDITORIAL_DRIFT, SUBTLE_BREATHE } from '@/components/gradient/GradientPlane'
import type { GradientPreset } from '@/components/gradient/GradientPlane'
import { createBreathGradient } from '@/lib/data/gradientPresets'

interface BreathProps {
  /** Deepest color of the outgoing section */
  outgoingDeep: string
  /** Bridge color — midpoint between sections */
  bridgeColor: string
  /** Deepest color of the incoming section */
  incomingDeep: string
  /** Fallback background color */
  fallbackColor?: string
  /** Unique ID for the breath section */
  id: string
  /** Custom gradient preset (overrides auto-generated) */
  preset?: GradientPreset
}

/**
 * Breath — a pure gradient crossfade between sections.
 *
 * No content. No text. Just color and dimension.
 *
 * Represents the "gallery hallway between rooms" — the reader
 * experiences a temperature change as the palette shifts from
 * the outgoing section to the incoming section.
 *
 * Spec requirements:
 * - Scroll budget: 0.75-1.5vh of pure gradient (75-150vh)
 * - Motion: Ambient only — WebGL gradient shifts slowly, independently of scroll
 * - Parallax: Most pronounced — 2-3 gradient shapes at different depths
 * - Easing: Slowest (power1.out or sine.inOut)
 * - Layout: Full-bleed, no grid, no content
 */
export function Breath({
  outgoingDeep,
  bridgeColor,
  incomingDeep,
  fallbackColor,
  id,
  preset,
}: BreathProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const breathPreset = preset ?? createBreathGradient(outgoingDeep, bridgeColor, incomingDeep)
  const fb = fallbackColor ?? bridgeColor
  const prefersReduced = useReducedMotion()

  // Parallax effect — gradient planes at different depths move at different speeds
  useEffect(() => {
    const el = containerRef.current
    if (!el || prefersReduced) return

    const bgPlane = el.querySelector('[data-breath-plane-bg]') as HTMLElement | null
    const fgPlane = el.querySelector('[data-breath-plane-fg]') as HTMLElement | null
    if (!bgPlane) return

    // Background plane — moves slowest (~85% of scroll speed)
    const bgTl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    })
    bgTl.fromTo(bgPlane, { yPercent: -8 }, { yPercent: 8, ease: 'none' })

    // Foreground plane — moves faster (~115% of scroll speed)
    let fgTl: gsap.core.Timeline | null = null
    if (fgPlane) {
      fgTl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
      fgTl.fromTo(fgPlane, { yPercent: -15 }, { yPercent: 15, ease: 'none' })
    }

    return () => {
      bgTl.kill()
      fgTl?.kill()
    }
  }, [])

  return (
    <section
      id={id}
      data-treatment="BREATH"
      className="relative overflow-hidden"
      ref={containerRef}
      style={{ height: '75vh' }}
    >
      {/* Background plane — full-bleed, slowest parallax */}
      <div
        data-breath-plane-bg
        className="absolute inset-0"
        style={{ top: '-10%', bottom: '-10%', height: '120%' }}
      >
        <GradientPlane
          preset={breathPreset}
          animation={EDITORIAL_DRIFT}
          className="absolute inset-0"
          fallbackColor={fb}
        />
      </div>

      {/* Foreground plane — smaller oval shape, faster parallax for depth */}
      <div
        data-breath-plane-fg
        className="absolute"
        style={{
          top: '15%',
          left: '20%',
          width: '60%',
          height: '70%',
          borderRadius: '50%',
          overflow: 'hidden',
          opacity: 0.35,
        }}
      >
        <GradientPlane
          preset={breathPreset}
          animation={SUBTLE_BREATHE}
          className="absolute inset-0"
          fallbackColor={fb}
        />
      </div>
    </section>
  )
}

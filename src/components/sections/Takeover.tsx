'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import type { GradientPreset, GradientAnimationConfig } from '@/components/gradient/GradientPlane'
import { GradientPlane } from '@/components/gradient/GradientPlane'
import type { DisplayFont } from '@/lib/data/sections'

interface TakeoverProps {
  /** Unique section ID */
  id: string
  /** Display font for the headline */
  displayFont: DisplayFont
  /** Headline text — split by line */
  lines: string[]
  /** Optional subtitle (Canela Thin) */
  subtitle?: string
  /** Gradient preset for the background */
  preset: GradientPreset
  /** Animation config for the gradient */
  animation: GradientAnimationConfig
  /** Fallback color for WebGL */
  fallbackColor: string
  /** Additional gradient planes for Stage Mode composition */
  additionalPlanes?: Array<{
    preset: GradientPreset
    animation?: GradientAnimationConfig
    className?: string
    fallbackColor?: string
  }>
  /** If true, content starts visible (hero sections at top of page).
   *  Only the release phase animates on scroll. */
  startAssembled?: boolean
  /** Semantic heading level for accessibility. Hero should be h1, others h2. */
  headingLevel?: 'h1' | 'h2' | 'h3'
}

/**
 * Font family CSS values.
 */
const FONT_STYLES: Record<DisplayFont, { fontFamily: string; letterSpacing: string; lineHeight: string }> = {
  tusker: {
    fontFamily: 'var(--font-tusker)',
    letterSpacing: '-0.03em',
    lineHeight: '0.88',
  },
  'bt-super': {
    fontFamily: 'var(--font-bt-super)',
    letterSpacing: '0',
    lineHeight: '0.92',
  },
  bulevar: {
    fontFamily: 'var(--font-bulevar-poster)',
    letterSpacing: '0',
    lineHeight: '0.95',
  },
}

/**
 * Takeover — full-viewport pinned scroll moment.
 *
 * The emotional peaks of the guide. Display typography at massive scale
 * over live WebGL gradient planes, with a 4-phase scroll structure:
 *
 * 1. APPROACH (0.5vh) — gradient planes begin emerging, elements fade in from distance
 * 2. ASSEMBLY (1vh) — display type layers converge, planes settle into composition
 * 3. HOLD (0.5-1vh) — composition complete, reader scrolls through static beauty
 * 4. RELEASE (0.5vh) — layers separate, parallax resumes, transition to next section
 *
 * Total scroll budget: 2-3vh (200-300vh of scroll distance while pinned).
 *
 * Motion is scrub-driven with power2.inOut easing. Multi-speed parallax
 * at three depths: background (85%), midground (100%), foreground (115%).
 */
export function Takeover({
  id,
  displayFont,
  lines,
  subtitle,
  preset,
  animation,
  fallbackColor,
  additionalPlanes = [],
  startAssembled = false,
  headingLevel,
}: TakeoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  const fontStyle = FONT_STYLES[displayFont]

  useEffect(() => {
    const container = containerRef.current
    const pin = pinRef.current
    if (!container || !pin) return

    // Get all animated elements
    const bgPlane = pin.querySelector('[data-takeover-bg]') as HTMLElement | null
    const fgPlanes = pin.querySelectorAll('[data-takeover-fg]')
    const typeLines = pin.querySelectorAll('[data-takeover-line]')
    const subtitleEl = pin.querySelector('[data-takeover-subtitle]') as HTMLElement | null

    // Reduced motion: still pin for scroll structure, but show everything immediately
    if (prefersReduced) {
      if (bgPlane) gsap.set(bgPlane, { scale: 1, opacity: 1 })
      fgPlanes.forEach((p) => gsap.set(p, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0 }))
      typeLines.forEach((l) => gsap.set(l, { opacity: 1, scale: 1, yPercent: 0 }))
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0.8, yPercent: 0 })

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: '+=250%',
        pin: pin,
        onEnter: () => {
          if (window.location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`)
        },
        onEnterBack: () => {
          if (window.location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`)
        },
      })

      return () => { trigger.kill() }
    }

    // === MASTER TIMELINE ===
    // Total scroll budget: 250vh (pinned distance)
    // Approach: 0-20% | Assembly: 20-50% | Hold: 50-75% | Release: 75-100%
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: '+=250%',
        pin: pin,
        scrub: 1.5,
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
      },
    })

    // === ALL CONTENT STARTS VISIBLE ===
    // Elements are assembled on arrival — no invisible-start scrub animations.
    // This guarantees content is never a black screen at any scroll position.
    if (bgPlane) gsap.set(bgPlane, { scale: 1, opacity: 1 })
    fgPlanes.forEach((p) => gsap.set(p, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0 }))
    typeLines.forEach((l) => gsap.set(l, { opacity: 1, scale: 1, yPercent: 0 }))
    if (subtitleEl) gsap.set(subtitleEl, { opacity: 0.8, yPercent: 0 })

    // === TRIGGERED ENTRANCE (non-hero only) ===
    // Fast, non-scrub animation when section enters viewport — gives approach/assembly feel.
    if (!startAssembled) {
      // Set subtle starting offsets (NOT invisible — just slightly offset)
      if (bgPlane) gsap.set(bgPlane, { scale: 0.97 })
      typeLines.forEach((l, i) => gsap.set(l, { yPercent: 8 + i * 3, opacity: 0.7 }))
      fgPlanes.forEach((p, i) => {
        const dir = i % 2 === 0 ? 1 : -1
        gsap.set(p, { xPercent: dir * 5, scale: 0.95 })
      })
      if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, yPercent: 10 })

      ScrollTrigger.create({
        trigger: container,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          // Fast entrance — 0.6-0.8s
          if (bgPlane) {
            gsap.to(bgPlane, { scale: 1, ease: 'power2.out', duration: 0.8 })
          }
          typeLines.forEach((l, i) => {
            gsap.to(l, {
              yPercent: 0, opacity: 1, ease: 'power2.out',
              duration: 0.6, delay: 0.05 * i,
            })
          })
          fgPlanes.forEach((p, i) => {
            gsap.to(p, {
              xPercent: 0, scale: 1, ease: 'power2.out',
              duration: 0.7, delay: 0.03 * i,
            })
          })
          if (subtitleEl) {
            gsap.to(subtitleEl, { opacity: 0.8, yPercent: 0, ease: 'power2.out', duration: 0.5, delay: 0.2 })
          }
        },
      })
    }

    // === HOLD (0% → 60%) ===
    // Composition is assembled. Subtle ambient breathing via scale.
    if (bgPlane) {
      tl.to(
        bgPlane,
        { scale: 1.03, ease: 'sine.inOut', duration: 0.6 },
        0,
      )
    }

    // === RELEASE (60% → 100%) ===
    // Layers separate — foreground faster, background slower.
    typeLines.forEach((line, i) => {
      tl.to(
        line,
        {
          yPercent: -30 - i * 10,
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.25,
        },
        0.6 + i * 0.03,
      )
    })

    if (subtitleEl) {
      tl.to(
        subtitleEl,
        { yPercent: -20, opacity: 0, ease: 'power2.in', duration: 0.2 },
        0.65,
      )
    }

    fgPlanes.forEach((plane, i) => {
      const direction = i % 2 === 0 ? -1 : 1
      tl.to(
        plane,
        {
          yPercent: -40,
          xPercent: direction * 20,
          opacity: 0,
          ease: 'power2.inOut',
          duration: 0.25,
        },
        0.7 + i * 0.03,
      )
    })

    if (bgPlane) {
      tl.to(
        bgPlane,
        { scale: 1.1, opacity: 0, ease: 'power2.inOut', duration: 0.2 },
        0.8,
      )
    }

    // === PARALLAX (ongoing throughout) ===
    // Background plane moves at 85% speed (separate ScrollTrigger)
    if (bgPlane) {
      gsap.to(bgPlane, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      })
    }

    // Foreground planes move at 115% speed
    fgPlanes.forEach((plane) => {
      gsap.to(plane, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    })

    return () => {
      tl.kill()
      // Kill all ScrollTriggers associated with this container
      ScrollTrigger.getAll()
        .filter((st) => st.trigger === container || st.vars.trigger === container)
        .forEach((st) => st.kill())
    }
  }, [id])

  return (
    <div
      ref={containerRef}
      id={id}
      data-treatment="TAKEOVER"
      className="relative"
    >
      <div
        ref={pinRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background gradient plane — deepest layer, 85% parallax speed */}
        <div data-takeover-bg className="absolute inset-0 z-0">
          <GradientPlane
            preset={preset}
            animation={animation}
            className="absolute inset-0"
            fallbackColor={fallbackColor}
          />
        </div>

        {/* Additional gradient planes for Stage Mode composition */}
        {additionalPlanes.map((plane, i) => (
          <div
            key={i}
            data-takeover-fg
            className={`absolute z-[1] ${plane.className ?? ''}`}
            style={{
              width: `${70 - i * 15}%`,
              height: `${60 - i * 10}%`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <GradientPlane
              preset={plane.preset}
              animation={plane.animation}
              className="absolute inset-0"
              fallbackColor={plane.fallbackColor ?? fallbackColor}
            />
          </div>
        ))}

        {/* Display type — foreground layer, 115% parallax speed */}
        <div className="relative z-10 text-center px-4">
          {(() => {
            const HeadingTag = headingLevel ?? 'div'
            return (
              <HeadingTag
                style={{
                  fontFamily: fontStyle.fontFamily,
                  fontSize: 'clamp(48px, 15vw, 200px)',
                  letterSpacing: fontStyle.letterSpacing,
                  lineHeight: fontStyle.lineHeight,
                  color: 'var(--white)',
                  fontWeight: 'inherit',
                }}
                className={displayFont === 'bulevar' ? '' : 'uppercase'}
              >
                {lines.map((line, i) => (
                  <span
                    key={i}
                    data-takeover-line={i}
                    className="block"
                  >
                    {line}
                  </span>
                ))}
              </HeadingTag>
            )
          })()}

          {subtitle && (
            <p
              data-takeover-subtitle
              className="mt-8"
              style={{
                fontFamily: 'var(--font-canela)',
                fontSize: 'clamp(16px, 3vw, 28px)',
                fontWeight: 100,
                lineHeight: 1.3,
                opacity: 0.8,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

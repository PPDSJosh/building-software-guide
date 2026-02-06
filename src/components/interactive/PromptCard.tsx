'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

interface PromptCardProps {
  /** The prompt text */
  prompt: string
  /** Optional label above the prompt */
  label?: string
  /** Border/accent gradient colors */
  gradientFrom?: string
  gradientTo?: string
  /** Maximum visual prominence — thicker border, larger text, glow effect */
  featured?: boolean
  className?: string
}

/**
 * PromptCard — a "precious artifact" for example prompts.
 *
 * Shows example Claude prompts with a gradient border treatment.
 * These are the prompts the reader will actually type — they should
 * feel special, worth saving, worth trying.
 *
 * Spec: "Precious artifact" treatment with gradient border/background.
 * Motion: Depth emergence (scale 95% → 100%), triggered not scrubbed.
 */
export function PromptCard({
  prompt,
  label = 'Try this prompt',
  gradientFrom = '#F9A223',
  gradientTo = '#E38227',
  featured = false,
  className = '',
}: PromptCardProps) {
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
    <div ref={ref} className={className}>
      {label && (
        <p
          className="text-xs uppercase tracking-widest mb-3 opacity-50"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
        </p>
      )}
      <div
        className={`relative rounded-xl ${featured ? 'p-[2px]' : 'p-[1px]'}`}
        style={{
          backgroundColor: gradientFrom,
          ...(featured
            ? {
                boxShadow: `0 0 40px ${gradientFrom}33, 0 0 80px ${gradientTo}1A, 0 8px 32px rgba(0,0,0,0.4)`,
              }
            : {}),
        }}
      >
        <div
          className={`rounded-xl ${featured ? 'px-8 py-8' : 'px-6 py-5'}`}
          style={{
            backgroundColor: 'rgba(9, 13, 16, 0.95)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-canela)',
              fontWeight: 100,
              fontSize: featured
                ? 'clamp(22px, 4vw, 32px)'
                : 'clamp(18px, 3vw, 24px)',
              lineHeight: 1.4,
              color: 'var(--white)',
            }}
          >
            &ldquo;{prompt}&rdquo;
          </p>
        </div>
      </div>
    </div>
  )
}

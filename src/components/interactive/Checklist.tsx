'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '@/lib/animation/gsap'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

interface ChecklistProps {
  /** List items */
  items: string[]
  /** Optional title */
  title?: string
  /** Accent color for checkmarks */
  accentColor?: string
  className?: string
}

/**
 * Checklist — interactive-feeling list of items.
 *
 * Used for setup steps, preparation lists, and action items.
 * Each item staggers in with a subtle entrance animation.
 */
export function Checklist({
  items,
  title,
  accentColor = 'var(--gold-mid, #F9A223)',
  className = '',
}: ChecklistProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    const listItems = el.querySelectorAll('[data-checklist-item]')

    gsap.fromTo(
      listItems,
      { x: -12, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
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
      {title && (
        <p
          className="text-xs uppercase tracking-widest mb-4 opacity-50"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {title}
        </p>
      )}
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            data-checklist-item
            className="flex items-start gap-3"
            style={{ fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
          >
            <span
              className="mt-1.5 w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center"
              style={{ borderColor: accentColor }}
            >
              <span
                className="w-2 h-2 rounded-[1px]"
                style={{ backgroundColor: accentColor }}
              />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

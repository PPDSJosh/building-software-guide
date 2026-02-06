'use client'

/**
 * useActiveSection — tracks which section is currently in view.
 *
 * Uses GSAP ScrollTrigger to detect which section occupies the viewport center.
 * Provides the active section slug for navigation highlighting, gradient transitions, etc.
 */

import { useEffect, useState } from 'react'
import { ScrollTrigger } from '@/lib/animation/gsap'

export function useActiveSection(): string | null {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    // On mount, check if there's a hash in the URL
    if (window.location.hash) {
      setActiveSection(window.location.hash.slice(1))
    }

    // Listen for hash changes (from Section component's ScrollTrigger callbacks)
    const handleHashChange = () => {
      setActiveSection(window.location.hash.slice(1) || null)
    }

    // Also listen for manual URL hash navigation
    window.addEventListener('hashchange', handleHashChange)

    // Refresh ScrollTrigger after all sections mount
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 100)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      clearTimeout(refreshTimeout)
    }
  }, [])

  return activeSection
}

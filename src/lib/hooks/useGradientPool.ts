'use client'

/**
 * Engine Pool — limits concurrent live WebGL gradient instances.
 *
 * The GradientLab engine uses WebGL contexts, which are a limited browser resource.
 * Most browsers allow ~8-16 concurrent contexts before starting to lose earlier ones.
 * We cap at MAX_ACTIVE (2) visible at any scroll position for performance.
 *
 * How it works:
 * 1. Each GradientPlane registers itself via useGradientPool()
 * 2. An IntersectionObserver tracks which planes are in/near the viewport
 * 3. Only the top MAX_ACTIVE visible planes get activated (render WebGL)
 * 4. Others get deactivated (show fallback color, no WebGL overhead)
 * 5. Priority is based on intersection ratio (most visible = highest priority)
 */

import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react'

const MAX_ACTIVE = 2
const ROOT_MARGIN = '200px 0px' // Pre-activate slightly before entering viewport

interface PoolEntry {
  id: string
  element: HTMLElement
  intersectionRatio: number
  isIntersecting: boolean
}

// ---- Singleton pool state ----

let entries: Map<string, PoolEntry> = new Map()
let activeIds: Set<string> = new Set()
let listeners: Set<() => void> = new Set()
let observer: IntersectionObserver | null = null
let nextId = 0

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

function recalculateActive() {
  // Sort visible entries by intersection ratio (most visible first)
  const visible = Array.from(entries.values())
    .filter((e) => e.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

  const newActive = new Set(visible.slice(0, MAX_ACTIVE).map((e) => e.id))

  // Only notify if the active set actually changed
  if (newActive.size !== activeIds.size || ![...newActive].every((id) => activeIds.has(id))) {
    activeIds = newActive
    notifyListeners()
  }
}

function getOrCreateObserver(): IntersectionObserver {
  if (!observer && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (intersectionEntries) => {
        for (const ie of intersectionEntries) {
          const id = (ie.target as HTMLElement).dataset.gradientPoolId
          if (!id) continue
          const entry = entries.get(id)
          if (entry) {
            entry.intersectionRatio = ie.intersectionRatio
            entry.isIntersecting = ie.isIntersecting
          }
        }
        recalculateActive()
      },
      {
        rootMargin: ROOT_MARGIN,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
      },
    )
  }
  return observer!
}

function registerEntry(element: HTMLElement): string {
  const id = `gp-${nextId++}`
  element.dataset.gradientPoolId = id

  entries.set(id, {
    id,
    element,
    intersectionRatio: 0,
    isIntersecting: false,
  })

  const obs = getOrCreateObserver()
  if (obs) obs.observe(element)

  return id
}

function unregisterEntry(id: string) {
  const entry = entries.get(id)
  if (entry) {
    const obs = getOrCreateObserver()
    if (obs) obs.unobserve(entry.element)
    entries.delete(id)
    recalculateActive()
  }

  // Clean up observer when no entries remain
  if (entries.size === 0 && observer) {
    observer.disconnect()
    observer = null
  }
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): Set<string> {
  return activeIds
}

const EMPTY_SET: Set<string> = new Set()

function getServerSnapshot(): Set<string> {
  return EMPTY_SET
}

// ---- React Hook ----

/**
 * useGradientPool — registers a gradient plane with the engine pool.
 *
 * Returns `isActive` which indicates whether this instance should render
 * its WebGL engine (true) or show the static fallback (false).
 *
 * Usage:
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 * const isActive = useGradientPool(containerRef)
 * // if (isActive) → render WebGL, else → show fallback color
 * ```
 */
export function useGradientPool(containerRef: React.RefObject<HTMLElement | null>): boolean {
  const idRef = useRef<string | null>(null)

  const currentActiveIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    idRef.current = registerEntry(element)
    // Force recalculation after registration
    recalculateActive()

    return () => {
      if (idRef.current) {
        unregisterEntry(idRef.current)
        idRef.current = null
      }
    }
  }, [containerRef])

  return idRef.current ? currentActiveIds.has(idRef.current) : false
}

/**
 * getActiveCount — returns the current number of active WebGL instances.
 * Useful for debugging.
 */
export function getActiveCount(): number {
  return activeIds.size
}

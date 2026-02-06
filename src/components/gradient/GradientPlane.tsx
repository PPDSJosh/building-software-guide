'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { GradientEngine } from '@/lib/engine/GradientEngine'
import { applyFullStateToEngine } from '@/lib/engine/standaloneRenderer'
import { useGradientPool } from '@/lib/hooks/useGradientPool'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'

/**
 * Animation configuration for ambient gradient movement.
 * Subset of GradientLab's full AnimationConfig — only what we need.
 */
export interface GradientAnimationConfig {
  rotationAmount?: number       // Degrees of rotation oscillation
  rotationSpeed?: number        // Speed multiplier (0-2)
  rotationMode?: 'oscillate' | 'continuous'
  scaleAmount?: number          // Percent of scale breathing
  scaleSpeed?: number           // Speed multiplier (0-2)
  movementAmount?: number       // Percent of position drift
  movementSpeed?: number        // Speed multiplier (0-2)
  movementPattern?: 'drift' | 'orbit' | 'pendulum'
  loopDuration?: number         // Base cycle duration in seconds
  intensity?: number            // Overall intensity multiplier (0-200)
}

/**
 * Gradient state — the data that defines what the gradient looks like.
 * This is a loose type that matches the shape applyFullStateToEngine expects.
 * See src/types/gradient.ts for the full typed version.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GradientPreset = Record<string, any>

interface GradientPlaneProps {
  /** Gradient state data — passed directly to applyFullStateToEngine */
  preset: GradientPreset
  /** Optional animation config for ambient movement */
  animation?: GradientAnimationConfig
  /** Whether this gradient should animate. Default: true if animation config provided */
  animate?: boolean
  /** Additional CSS class names */
  className?: string
  /** Additional inline styles */
  style?: CSSProperties
  /** Whether to show a fallback background color if WebGL fails */
  fallbackColor?: string
  /** Whether to participate in engine pooling. Default: true */
  pooled?: boolean
}

/** Default subtle ambient animation */
export const SUBTLE_BREATHE: GradientAnimationConfig = {
  rotationAmount: 8,
  rotationSpeed: 0.3,
  rotationMode: 'oscillate',
  scaleAmount: 12,
  scaleSpeed: 0.4,
  movementAmount: 15,
  movementSpeed: 0.25,
  movementPattern: 'drift',
  loopDuration: 8,
  intensity: 100,
}

/** More dramatic ambient animation */
export const DRAMATIC_BREATHE: GradientAnimationConfig = {
  rotationAmount: 20,
  rotationSpeed: 0.5,
  rotationMode: 'oscillate',
  scaleAmount: 30,
  scaleSpeed: 0.6,
  movementAmount: 25,
  movementSpeed: 0.4,
  movementPattern: 'drift',
  loopDuration: 6,
  intensity: 200,
}

/** Very slow, minimal ambient motion — for editorial backgrounds */
export const EDITORIAL_DRIFT: GradientAnimationConfig = {
  rotationAmount: 4,
  rotationSpeed: 0.15,
  rotationMode: 'oscillate',
  scaleAmount: 5,
  scaleSpeed: 0.2,
  movementAmount: 8,
  movementSpeed: 0.12,
  movementPattern: 'drift',
  loopDuration: 12,
  intensity: 60,
}

const MAX_INIT_RETRIES = 30
const INIT_RETRY_BASE_DELAY = 25
const MAX_INIT_RETRY_DELAY = 200
const STRICT_MODE_THRESHOLD_MS = 100

/**
 * GradientPlane — renders a live WebGL gradient using the GradientLab engine.
 *
 * This component creates a canvas element, initializes a GradientEngine,
 * applies the provided gradient state (including warps, materials, effects),
 * and optionally runs an ambient animation loop.
 *
 * Usage:
 * ```tsx
 * <GradientPlane
 *   preset={myGradientState}
 *   animation={SUBTLE_BREATHE}
 *   className="absolute inset-0"
 * />
 * ```
 */
export function GradientPlane({
  preset,
  animation,
  animate = !!animation,
  className = '',
  style,
  fallbackColor = '#090D10',
  pooled = true,
}: GradientPlaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const poolRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const engineRef = useRef<GradientEngine | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const mountedRef = useRef(true)
  const timeRef = useRef(0)
  const baselineAngle = useRef(0)
  const baselineScale = useRef(1)
  const baselineCenterX = useRef(50)
  const baselineCenterY = useRef(50)

  const [isLoaded, setIsLoaded] = useState(false)
  const [webglFailed, setWebglFailed] = useState(false)
  const prefersReduced = useReducedMotion()

  // Engine pooling — only active instances get WebGL rendering
  const isPoolActive = useGradientPool(poolRef)
  const shouldRender = !pooled || isPoolActive

  // Disable animation loop when user prefers reduced motion
  const shouldAnimate = animate && !prefersReduced

  const config = animation ?? SUBTLE_BREATHE

  // Initialize / teardown engine based on pool activation
  useEffect(() => {
    if (!shouldRender) {
      // Pool says we're inactive — dispose engine if it exists
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (engineRef.current) {
        try { engineRef.current.dispose() } catch { /* ignore */ }
        engineRef.current = null
      }
      if (canvasRef.current && containerRef.current?.contains(canvasRef.current)) {
        containerRef.current.removeChild(canvasRef.current)
      }
      canvasRef.current = null
      setIsLoaded(false)
      return
    }

    // shouldRender is true — initialize engine
    mountedRef.current = true
    const mountTime = Date.now()
    let isCleanedUp = false
    let retryTimeoutId: number | null = null
    let resizeObserver: ResizeObserver | undefined

    // Create canvas element
    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.display = 'block'
    canvasRef.current = canvas

    if (containerRef.current) {
      containerRef.current.appendChild(canvas)
    }

    const initializeEngine = (attempt: number): boolean => {
      if (isCleanedUp || !mountedRef.current || !canvas) return false
      try {
        if (!engineRef.current) {
          engineRef.current = new GradientEngine(canvas)
        }
        return true
      } catch (error) {
        if (attempt === 0) {
          console.warn('[GradientPlane] WebGL init failed, will retry:', error)
        }
        return false
      }
    }

    const updateSize = () => {
      if (!containerRef.current || !engineRef.current || isCleanedUp) return
      try {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          engineRef.current.handleResize(Math.floor(rect.width), Math.floor(rect.height))
          engineRef.current.render()
        }
      } catch (error) {
        console.warn('[GradientPlane] Resize error:', error)
      }
    }

    const initializeWithRetry = (attempts = 0) => {
      if (isCleanedUp || !mountedRef.current) return

      const success = initializeEngine(attempts)
      if (!success && attempts < MAX_INIT_RETRIES) {
        const delay = Math.min(INIT_RETRY_BASE_DELAY * Math.pow(1.2, attempts), MAX_INIT_RETRY_DELAY)
        retryTimeoutId = window.setTimeout(() => initializeWithRetry(attempts + 1), delay)
        return
      }
      if (!success) {
        if (mountedRef.current) setWebglFailed(true)
        return
      }

      if (!containerRef.current) {
        if (attempts < MAX_INIT_RETRIES) {
          const delay = Math.min(INIT_RETRY_BASE_DELAY * Math.pow(1.2, attempts), MAX_INIT_RETRY_DELAY)
          retryTimeoutId = window.setTimeout(() => initializeWithRetry(attempts + 1), delay)
        }
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const width = Math.max(rect.width || 800, 1)
      const height = Math.max(rect.height || 600, 1)

      canvas.width = width
      canvas.height = height

      updateSize()

      try {
        if (engineRef.current) {
          applyFullStateToEngine(engineRef.current, preset)
          baselineAngle.current = preset.angle ?? 0
          baselineScale.current = 1.0
          baselineCenterX.current = 50
          baselineCenterY.current = 50
          engineRef.current.render()

          if (mountedRef.current) {
            setIsLoaded(true)
          }

          // Ensure render catches up
          const ensureRender = () => {
            if (isCleanedUp || !engineRef.current) return
            updateSize()
            engineRef.current.render()
          }
          setTimeout(ensureRender, 50)
          setTimeout(ensureRender, 150)
        }
      } catch (error) {
        console.warn('[GradientPlane] Initial render error:', error)
      }
    }

    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateSize)
    })
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    initializeWithRetry()
    window.addEventListener('resize', updateSize)

    return () => {
      isCleanedUp = true
      if (retryTimeoutId !== null) clearTimeout(retryTimeoutId)
      window.removeEventListener('resize', updateSize)
      resizeObserver?.disconnect()
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)

      const cleanupTime = Date.now()
      const isStrictModeCleanup = cleanupTime - mountTime < STRICT_MODE_THRESHOLD_MS

      if (engineRef.current && !isStrictModeCleanup) {
        try { engineRef.current.dispose() } catch { /* ignore */ }
        engineRef.current = null
      }

      if (canvasRef.current && containerRef.current?.contains(canvasRef.current)) {
        containerRef.current.removeChild(canvasRef.current)
      }
      canvasRef.current = null
    }
  }, [shouldRender]) // eslint-disable-line react-hooks/exhaustive-deps

  // Apply preset changes
  useEffect(() => {
    if (!engineRef.current || !preset) return
    try {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      const uniforms = engineRef.current.getUniforms()
      if (uniforms.u_gradientScale) uniforms.u_gradientScale.value = 1.0
      if (uniforms.centerX) uniforms.centerX.value = 0.5
      if (uniforms.centerY) uniforms.centerY.value = 0.5

      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          engineRef.current.handleResize(Math.floor(rect.width), Math.floor(rect.height))
        }
      }

      applyFullStateToEngine(engineRef.current, preset)
      baselineAngle.current = preset.angle ?? 0
      baselineScale.current = 1.0
      baselineCenterX.current = 50
      baselineCenterY.current = 50
      timeRef.current = performance.now() / 1000
      engineRef.current.render()
    } catch (error) {
      console.warn('[GradientPlane] Failed to apply preset:', error)
    }
  }, [preset])

  // Animation loop
  const animateFrame = useCallback(() => {
    if (!engineRef.current || !shouldAnimate) return

    const engine = engineRef.current
    const uniforms = engine.getUniforms()
    const now = performance.now() / 1000

    const intensityMult = (config.intensity ?? 100) / 100
    const baseDuration = config.loopDuration ?? 6

    const oscillate = (t: number, period: number, amplitude: number) =>
      Math.sin(t * (Math.PI * 2) / period) * amplitude

    // Rotation
    const rotationAmount = config.rotationAmount ?? 0
    if (rotationAmount > 0) {
      const rotationSpeed = config.rotationSpeed ?? 1
      const duration = baseDuration / rotationSpeed
      const amplitude = rotationAmount * intensityMult

      if (config.rotationMode === 'continuous') {
        engine.setAngle(baselineAngle.current + (now * rotationSpeed * 30) % 360)
      } else {
        engine.setAngle(baselineAngle.current + oscillate(now, duration, amplitude))
      }
    }

    // Scale
    const scaleAmount = config.scaleAmount ?? 0
    if (scaleAmount > 0 && uniforms.u_gradientScale) {
      const scaleSpeed = config.scaleSpeed ?? 1
      const duration = baseDuration / scaleSpeed
      const scaleRange = baselineScale.current * (scaleAmount / 100) * intensityMult
      uniforms.u_gradientScale.value = baselineScale.current + oscillate(now, duration, scaleRange)
    }

    // Movement
    const movementAmount = config.movementAmount ?? 0
    if (movementAmount > 0) {
      const moveSpeed = config.movementSpeed ?? 1
      const duration = baseDuration / moveSpeed
      const moveRange = (movementAmount / 100) * 20 * intensityMult

      let offsetX = 0
      let offsetY = 0
      const pattern = config.movementPattern ?? 'drift'

      switch (pattern) {
        case 'drift':
          offsetX = oscillate(now, duration, moveRange)
          offsetY = oscillate(now, duration * 1.3, moveRange * 0.7)
          break
        case 'orbit':
          offsetX = Math.cos(now * (Math.PI * 2) / duration) * moveRange
          offsetY = Math.sin(now * (Math.PI * 2) / duration) * moveRange
          break
        case 'pendulum':
          offsetX = oscillate(now, duration, moveRange)
          offsetY = 0
          break
      }

      if (uniforms.centerX) {
        uniforms.centerX.value = (baselineCenterX.current + offsetX) / 100
      }
      if (uniforms.centerY) {
        uniforms.centerY.value = (baselineCenterY.current + offsetY) / 100
      }
    }

    engine.render()
    animationFrameRef.current = requestAnimationFrame(animateFrame)
  }, [shouldAnimate, config])

  // Start/stop animation
  useEffect(() => {
    if (!isLoaded || !shouldAnimate) return

    animationFrameRef.current = requestAnimationFrame(animateFrame)
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isLoaded, shouldAnimate, animateFrame])

  if (webglFailed || !shouldRender) {
    return (
      <div
        ref={poolRef}
        className={`relative overflow-hidden ${className}`}
        style={{ backgroundColor: fallbackColor, ...style }}
      />
    )
  }

  return (
    <div
      ref={(node) => {
        // Share ref between pool tracking and container
        ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        ;(poolRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      }}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease',
        willChange: shouldAnimate ? 'transform' : undefined,
      }}
    />
  )
}

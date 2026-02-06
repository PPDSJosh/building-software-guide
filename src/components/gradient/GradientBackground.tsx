'use client'

import { GradientPlane, type GradientAnimationConfig, type GradientPreset } from './GradientPlane'

interface GradientBackgroundProps {
  /** Gradient state data */
  preset: GradientPreset
  /** Optional animation config */
  animation?: GradientAnimationConfig
  /** Whether to animate. Default: true if animation provided */
  animate?: boolean
  /** Fallback color if WebGL fails */
  fallbackColor?: string
  /** Content rendered on top of the gradient */
  children?: React.ReactNode
  /** Additional CSS class names for the outer container */
  className?: string
}

/**
 * GradientBackground — full-bleed gradient that sits behind content.
 *
 * Wraps GradientPlane in a positioned container and layers children on top.
 * Use this for section backgrounds where content floats over a live gradient.
 *
 * Usage:
 * ```tsx
 * <GradientBackground preset={HERO_GRADIENT} animation={DRAMATIC_BREATHE}>
 *   <h1>Content on top of gradient</h1>
 * </GradientBackground>
 * ```
 */
export function GradientBackground({
  preset,
  animation,
  animate,
  fallbackColor = '#090D10',
  children,
  className = '',
}: GradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <GradientPlane
        preset={preset}
        animation={animation}
        animate={animate}
        className="absolute inset-0 z-0"
        fallbackColor={fallbackColor}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

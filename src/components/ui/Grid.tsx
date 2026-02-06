'use client'

import { type ReactNode } from 'react'

interface GridContainerProps {
  children: ReactNode
  className?: string
}

/** Full 12-column grid container, max 1400px, centered */
export function GridContainer({ children, className = '' }: GridContainerProps) {
  return (
    <div
      className={`mx-auto w-full ${className}`}
      style={{
        maxWidth: 'var(--grid-max-width)',
        paddingLeft: 'var(--grid-outer-margin)',
        paddingRight: 'var(--grid-outer-margin)',
      }}
    >
      {children}
    </div>
  )
}

interface ContentZoneProps {
  children: ReactNode
  zone: 'narrow' | 'medium' | 'wide' | 'full'
  className?: string
  centered?: boolean
}

/** Content zone within the grid — narrow (6-col/680px), medium (8-col/920px), wide (10-col/1160px), or full-bleed */
export function ContentZone({ children, zone, className = '', centered = true }: ContentZoneProps) {
  const maxWidths: Record<string, string> = {
    narrow: 'var(--container-narrow)',
    medium: 'var(--container-medium)',
    wide: 'var(--container-wide)',
    full: '100%',
  }

  return (
    <div
      className={`w-full ${centered ? 'mx-auto' : ''} ${className}`}
      style={{
        maxWidth: maxWidths[zone],
      }}
    >
      {children}
    </div>
  )
}

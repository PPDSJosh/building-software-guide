/**
 * Section definitions — the 16 sections of the guide with metadata.
 *
 * Each section has a URL slug (for hash navigation), display name,
 * treatment level assignment, display font choice, and composition mode.
 */

import type { ColorFamily } from './colors'

/** Treatment level — determines visual intensity of a section */
export type TreatmentLevel = 'TAKEOVER' | 'REVEAL' | 'EDITORIAL' | 'INTERACTIVE' | 'BREATH'

/** Composition mode for gradient planes */
export type CompositionMode = 'stage' | 'frame'

/** Display font rotation — which display face to use */
export type DisplayFont = 'tusker' | 'bt-super' | 'bulevar'

export interface SectionDefinition {
  /** 1-based section number */
  id: number
  /** URL hash slug */
  slug: string
  /** Display name */
  name: string
  /** Primary color family */
  baseFamily: ColorFamily
  /** Display font for TAKEOVER/REVEAL moments */
  displayFont: DisplayFont
  /** Gradient composition mode */
  compositionMode: CompositionMode
  /** Has a BREATH transition after it */
  breathAfter: boolean
}

/**
 * All 16 sections in reading order.
 *
 * Display font rotation follows the spec pattern:
 * Tusker → BT Super → Bulevar → Tusker → BT Super → ...
 */
export const SECTIONS: SectionDefinition[] = [
  { id: 1,  slug: 'hero',            name: 'Hero / Opening',           baseFamily: 'gold',    displayFont: 'tusker',   compositionMode: 'stage', breathAfter: true },
  { id: 2,  slug: 'foundations',      name: 'What Is Software, Actually?', baseFamily: 'blue', displayFont: 'bt-super', compositionMode: 'frame', breathAfter: true },
  { id: 3,  slug: 'tell-claude',      name: 'Tell Claude What You Want', baseFamily: 'green',  displayFont: 'bulevar',  compositionMode: 'stage', breathAfter: true },
  { id: 4,  slug: 'how-code-lives',   name: 'How Code Lives On Your Computer', baseFamily: 'blue', displayFont: 'tusker', compositionMode: 'frame', breathAfter: true },
  { id: 5,  slug: 'setup',            name: 'Setup Workshop',           baseFamily: 'gold',    displayFont: 'bt-super', compositionMode: 'frame', breathAfter: true },
  { id: 6,  slug: 'tools',            name: 'Tool Sections',            baseFamily: 'teal',    displayFont: 'bulevar',  compositionMode: 'frame', breathAfter: true },
  { id: 7,  slug: 'before-you-start', name: 'Before You Start Building', baseFamily: 'red',   displayFont: 'tusker',   compositionMode: 'stage', breathAfter: true },
  { id: 8,  slug: 'phase-1',          name: 'Phase 1: Your Idea',       baseFamily: 'red',     displayFont: 'bt-super', compositionMode: 'stage', breathAfter: true },
  { id: 9,  slug: 'phase-2',          name: 'Phase 2: Research',        baseFamily: 'teal',    displayFont: 'bulevar',  compositionMode: 'frame', breathAfter: true },
  { id: 10, slug: 'phase-3',          name: 'Phase 3: The Spec',        baseFamily: 'blue',    displayFont: 'tusker',   compositionMode: 'frame', breathAfter: true },
  { id: 11, slug: 'phase-4',          name: 'Phase 4: The Plan',        baseFamily: 'gold',    displayFont: 'bt-super', compositionMode: 'stage', breathAfter: true },
  { id: 12, slug: 'phase-5',          name: 'Phase 5: Building',        baseFamily: 'blue',    displayFont: 'bulevar',  compositionMode: 'stage', breathAfter: true },
  { id: 13, slug: 'phase-6',          name: 'Phase 6: Deployment',      baseFamily: 'green',   displayFont: 'tusker',   compositionMode: 'frame', breathAfter: true },
  { id: 14, slug: 'phase-7',          name: 'Phase 7: Maintenance',     baseFamily: 'teal',    displayFont: 'bt-super', compositionMode: 'frame', breathAfter: true },
  { id: 15, slug: 'when-things-go-wrong', name: 'When Things Go Wrong', baseFamily: 'gold',  displayFont: 'bulevar',  compositionMode: 'frame', breathAfter: true },
  { id: 16, slug: 'glossary',         name: 'Glossary',                 baseFamily: 'neutral',  displayFont: 'bulevar',  compositionMode: 'frame', breathAfter: false },
]

/** Lookup section by slug */
export function getSectionBySlug(slug: string): SectionDefinition | undefined {
  return SECTIONS.find((s) => s.slug === slug)
}

/** Lookup section by id */
export function getSectionById(id: number): SectionDefinition | undefined {
  return SECTIONS.find((s) => s.id === id)
}

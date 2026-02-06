/**
 * Master color palette — all hex values from the PPDS strategy deck.
 * These are the approved colors used throughout the design system.
 */

// === Neutral Foundation ===
export const NEUTRAL = {
  night: '#090D10',
  black: '#000000',
  middleGray: '#969696',
  lightGray: '#F9F9F9',
  white: '#FFFFFF',
} as const

// === Gold / Amber Family ===
export const GOLD = {
  deepest: '#592D11',
  dark: '#E38227',
  mid: '#F9A223',
  bright: '#DCA14C',
  light: '#FEF2E2',
  text: '#F7D8AB',
} as const

// === Blue / Purple Family ===
export const BLUE = {
  deepest: '#150B49',
  dark: '#1B0C6F',
  darkAlt: '#480C79',
  mid: '#3500FF',
  bright: '#8C00FF',
  light: '#EEEBFF',
  lightAlt: '#E4C7FC',
  electric: '#FF00D4',
} as const

// === Green Family ===
export const GREEN = {
  deepest: '#091410',
  dark: '#142819',
  darkAlt: '#002F26',
  mid: '#1E7C40',
  bright: '#78DB89',
  neighbor: '#006653',
} as const

// === Teal Family ===
export const TEAL = {
  deepest: '#122526',
  dark: '#1C3C3D',
  mid: '#41AAAE',
  bright: '#73CBC4',
  electric: '#00FFC5',
} as const

// === Red / Crimson Family ===
export const RED = {
  deepest: '#680300',
  dark: '#8F0300',
  mid: '#F5241F',
  light: '#FFDCDB',
  warmGray: '#7C7070',
} as const

// === Accent Colors ===
export const ACCENT = {
  magenta: '#FF00D4',
  peach: '#F7D8AB',
  warmGray: '#7C7070',
} as const

/** Color family type for section assignments */
export type ColorFamily = 'gold' | 'blue' | 'green' | 'teal' | 'red' | 'neutral'

/** Temperature classification */
export type Temperature = 'warm' | 'cool' | 'cool-warm' | 'neutral'

/** Section color assignment */
export interface SectionPalette {
  id: number
  name: string
  baseFamily: ColorFamily
  secondaryFamilies: ColorFamily[]
  temperature: Temperature
  deepest: string
  dark: string
  mid: string
  bright: string
  light?: string
}

/** All 16 section palette assignments */
export const SECTION_PALETTES: SectionPalette[] = [
  { id: 1, name: 'Hero / Opening', baseFamily: 'gold', secondaryFamilies: ['red', 'blue'], temperature: 'warm', deepest: GOLD.deepest, dark: GOLD.dark, mid: GOLD.mid, bright: GOLD.bright, light: GOLD.light },
  { id: 2, name: 'Foundations', baseFamily: 'blue', secondaryFamilies: ['teal'], temperature: 'cool', deepest: BLUE.deepest, dark: BLUE.dark, mid: BLUE.mid, bright: BLUE.bright, light: BLUE.light },
  { id: 3, name: 'Tell Claude', baseFamily: 'green', secondaryFamilies: ['teal'], temperature: 'cool-warm', deepest: GREEN.deepest, dark: GREEN.dark, mid: GREEN.mid, bright: GREEN.bright },
  { id: 4, name: 'How Code Lives', baseFamily: 'blue', secondaryFamilies: ['red'], temperature: 'cool', deepest: BLUE.deepest, dark: BLUE.darkAlt, mid: BLUE.bright, bright: BLUE.lightAlt, light: BLUE.light },
  { id: 5, name: 'Setup Workshop', baseFamily: 'gold', secondaryFamilies: ['red'], temperature: 'warm', deepest: GOLD.deepest, dark: GOLD.dark, mid: GOLD.mid, bright: GOLD.bright, light: GOLD.light },
  { id: 6, name: 'Tool Sections', baseFamily: 'teal', secondaryFamilies: ['blue'], temperature: 'cool', deepest: TEAL.deepest, dark: TEAL.dark, mid: TEAL.mid, bright: TEAL.bright },
  { id: 7, name: 'Before You Start', baseFamily: 'red', secondaryFamilies: ['gold'], temperature: 'warm', deepest: RED.deepest, dark: RED.dark, mid: RED.mid, bright: RED.light },
  { id: 8, name: 'Phase 1: Your Idea', baseFamily: 'red', secondaryFamilies: ['gold'], temperature: 'warm', deepest: RED.deepest, dark: RED.dark, mid: RED.mid, bright: RED.light },
  { id: 9, name: 'Phase 2: Research', baseFamily: 'teal', secondaryFamilies: ['green'], temperature: 'cool', deepest: TEAL.deepest, dark: TEAL.dark, mid: TEAL.mid, bright: TEAL.bright },
  { id: 10, name: 'Phase 3: The Spec', baseFamily: 'blue', secondaryFamilies: ['blue'], temperature: 'cool', deepest: BLUE.deepest, dark: BLUE.darkAlt, mid: BLUE.bright, bright: BLUE.lightAlt, light: BLUE.light },
  { id: 11, name: 'Phase 4: The Plan', baseFamily: 'gold', secondaryFamilies: ['red'], temperature: 'warm', deepest: GOLD.deepest, dark: GOLD.dark, mid: GOLD.mid, bright: GOLD.bright, light: GOLD.light },
  { id: 12, name: 'Phase 5: Building', baseFamily: 'blue', secondaryFamilies: ['teal'], temperature: 'cool', deepest: BLUE.deepest, dark: BLUE.dark, mid: BLUE.mid, bright: BLUE.bright, light: BLUE.light },
  { id: 13, name: 'Phase 6: Deployment', baseFamily: 'green', secondaryFamilies: ['teal'], temperature: 'cool-warm', deepest: GREEN.deepest, dark: GREEN.dark, mid: GREEN.mid, bright: GREEN.bright },
  { id: 14, name: 'Phase 7: Maintenance', baseFamily: 'teal', secondaryFamilies: ['blue'], temperature: 'cool', deepest: TEAL.deepest, dark: TEAL.dark, mid: TEAL.mid, bright: TEAL.bright },
  { id: 15, name: 'When Things Go Wrong', baseFamily: 'gold', secondaryFamilies: ['red'], temperature: 'warm', deepest: GOLD.deepest, dark: GOLD.bright, mid: GOLD.light, bright: RED.light },
  { id: 16, name: 'Glossary', baseFamily: 'neutral', secondaryFamilies: ['blue'], temperature: 'neutral', deepest: NEUTRAL.night, dark: NEUTRAL.middleGray, mid: NEUTRAL.lightGray, bright: NEUTRAL.white },
]

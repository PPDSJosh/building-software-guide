/**
 * Gradient presets for each section of the guide.
 * These define the WebGL gradient states — colors, type, warps, materials, effects.
 *
 * IMPORTANT: No CSS gradients. Everything is rendered via the GradientLab engine.
 *
 * Effects are critical — grain, glow, chromatic aberration, vignette, etc.
 * create the rich, textured, printed-color-warmth quality that makes these
 * gradients feel alive and physical rather than flat digital.
 *
 * Only ASCII and dot matrix effects are excluded.
 */

import type { GradientPreset } from '@/components/gradient/GradientPlane'

/** Disabled effect shorthand */
const off = { enabled: false }

/** Disabled geometry */
const noGeometry = {
  type: 'none',
  effects: { grid: off, columns: off, depth: off },
}

/** Disabled warps */
const noWarps = {
  bend: { enabled: false, amount: 0 },
  wave: { enabled: false, amount: 0 },
  ripple: { enabled: false, amount: 0 },
  twist: { enabled: false, amount: 0 },
  bulge: { enabled: false, amount: 0 },
  sphere: { enabled: false, amount: 0 },
  blur: { enabled: false, amount: 0 },
  isMuted: false,
}

/** Disabled materials */
const noMaterials = {
  iridescent: { enabled: false, intensity: 0 },
  metallic: { enabled: false, intensity: 0 },
  holographic: { enabled: false, intensity: 0 },
  velvet: { enabled: false, intensity: 0 },
}

// ============================================
// SECTION 1: HERO / OPENING — Gold family
// Rich, confident, warm. Stage Mode.
// ============================================
export const HERO_GRADIENT: GradientPreset = {
  gradientType: 'radial',
  colors: [
    { id: '1', color: '#592D11', position: 0 },
    { id: '2', color: '#E38227', position: 30 },
    { id: '3', color: '#F9A223', position: 55 },
    { id: '4', color: '#DCA14C', position: 75 },
    { id: '5', color: '#680300', position: 100 },
  ],
  angle: 135,
  warps: {
    ...noWarps,
    sphere: { enabled: true, amount: 30, radius: 0.9, centerX: 50, centerY: 45 },
    wave: { enabled: true, amount: 12, frequency: 2, direction: 'horizontal', rotation: 20 },
  },
  materials: {
    ...noMaterials,
    iridescent: { enabled: true, intensity: 20, scale: 2, shift: 45, blendMode: 'screen' },
    velvet: { enabled: true, intensity: 15, depth: 40, glow: 20, blendMode: 'soft-light' },
  },
  effects: {
    color: { enabled: true, brightness: 5, contrast: 10, saturation: 8, hueShift: 0 },
    glow: { enabled: true, amount: 25, threshold: 35, radius: 30 },
    chromatic: { enabled: true, amount: 6, angle: 45 },
    vignette: { enabled: true, amount: 30, softness: 60, roundness: 50, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 12, size: 1.5, mono: true },
    dither: { enabled: true, amount: 15 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

/**
 * Hero Stage Mode companion — mid-layer plane.
 * Red/Gold blend. Sits at ~70% width of viewport in Stage Mode.
 */
export const HERO_STAGE_MID: GradientPreset = {
  gradientType: 'linear',
  colors: [
    { id: '1', color: '#680300', position: 0 },
    { id: '2', color: '#8F0300', position: 35 },
    { id: '3', color: '#E38227', position: 65 },
    { id: '4', color: '#F9A223', position: 100 },
  ],
  angle: 220,
  warps: {
    ...noWarps,
    bend: { enabled: true, amount: 20, axis: 45, pinch: 10 },
  },
  materials: {
    ...noMaterials,
    velvet: { enabled: true, intensity: 18, depth: 35, glow: 25, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 3, contrast: 8, saturation: 6, hueShift: 0 },
    glow: { enabled: true, amount: 20, threshold: 40, radius: 25 },
    chromatic: { enabled: true, amount: 4, angle: 120 },
    vignette: { enabled: true, amount: 25, softness: 65, roundness: 55, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.3, mono: true },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

/**
 * Hero Stage Mode companion — foreground accent plane.
 * Blue/Purple with Gold accent. Smallest plane, highest contrast.
 */
export const HERO_STAGE_FG: GradientPreset = {
  gradientType: 'conic',
  colors: [
    { id: '1', color: '#150B49', position: 0 },
    { id: '2', color: '#3500FF', position: 30 },
    { id: '3', color: '#F9A223', position: 60 },
    { id: '4', color: '#680300', position: 85 },
    { id: '5', color: '#150B49', position: 100 },
  ],
  angle: 0,
  conicSettings: {
    positionX: 50,
    positionY: 50,
    startAngle: 30,
    arc: 360,
    repeatCount: 1,
  },
  warps: {
    ...noWarps,
    sphere: { enabled: true, amount: 25, radius: 0.8, centerX: 50, centerY: 50 },
  },
  materials: {
    ...noMaterials,
    iridescent: { enabled: true, intensity: 22, scale: 2.5, shift: 60, blendMode: 'screen' },
    metallic: { enabled: true, intensity: 8, highlight: 50, contrast: 35, blendMode: 'overlay' },
  },
  effects: {
    color: { enabled: true, brightness: 5, contrast: 12, saturation: 10, hueShift: 0 },
    glow: { enabled: true, amount: 28, threshold: 30, radius: 30 },
    chromatic: { enabled: true, amount: 7, angle: 60 },
    vignette: { enabled: true, amount: 20, softness: 55, roundness: 50, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.2, mono: true },
    dither: { enabled: true, amount: 14 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 2: FOUNDATIONS — Blue/Purple family
// Clear, expansive, cool. Frame Mode.
// ============================================
export const FOUNDATIONS_GRADIENT: GradientPreset = {
  gradientType: 'linear',
  colors: [
    { id: '1', color: '#150B49', position: 0 },
    { id: '2', color: '#1B0C6F', position: 35 },
    { id: '3', color: '#3500FF', position: 65 },
    { id: '4', color: '#41AAAE', position: 90 },
    { id: '5', color: '#122526', position: 100 },
  ],
  angle: 160,
  warps: {
    ...noWarps,
    bend: { enabled: true, amount: 25, axis: 90, pinch: 15 },
  },
  materials: {
    ...noMaterials,
    holographic: { enabled: true, intensity: 12, density: 8, angle: 30, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 0, contrast: 8, saturation: 5, hueShift: 0 },
    glow: { enabled: true, amount: 18, threshold: 45, radius: 25 },
    chromatic: { enabled: true, amount: 4, angle: 120 },
    vignette: { enabled: true, amount: 25, softness: 70, roundness: 60, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.2, mono: true },
    dither: { enabled: true, amount: 10 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 3: TELL CLAUDE — Green family
// Fresh, alive, permission-giving. Stage Mode.
// ============================================
export const TELL_CLAUDE_GRADIENT: GradientPreset = {
  gradientType: 'aurora',
  colors: [
    { id: '1', color: '#091410', position: 0 },
    { id: '2', color: '#002F26', position: 25 },
    { id: '3', color: '#1E7C40', position: 50 },
    { id: '4', color: '#78DB89', position: 75 },
    { id: '5', color: '#006653', position: 100 },
  ],
  angle: 45,
  auroraSettings: {
    waveCount: 4,
    flow: 60,
    softness: 70,
    verticalPosition: 50,
    rotation: 15,
    spread: 65,
    intensity: 80,
    blend: 60,
  },
  warps: {
    ...noWarps,
    wave: { enabled: true, amount: 18, frequency: 3, direction: 'diagonal', rotation: 30 },
  },
  materials: {
    ...noMaterials,
    velvet: { enabled: true, intensity: 20, depth: 50, glow: 25, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 3, contrast: 12, saturation: 10, hueShift: 0 },
    glow: { enabled: true, amount: 22, threshold: 40, radius: 28 },
    chromatic: { enabled: true, amount: 5, angle: 60 },
    vignette: { enabled: true, amount: 20, softness: 65, roundness: 55, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.3, mono: false },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 5: SETUP WORKSHOP — Gold family (utilitarian)
// Grounded, practical, steady. Frame Mode.
// ============================================
export const SETUP_GRADIENT: GradientPreset = {
  gradientType: 'linear',
  colors: [
    { id: '1', color: '#592D11', position: 0 },
    { id: '2', color: '#E38227', position: 45 },
    { id: '3', color: '#DCA14C', position: 70 },
    { id: '4', color: '#8F0300', position: 100 },
  ],
  angle: 200,
  warps: {
    ...noWarps,
    bend: { enabled: true, amount: 15, axis: 0, pinch: 8 },
  },
  materials: noMaterials,
  effects: {
    color: { enabled: true, brightness: -5, contrast: 5, saturation: -10, hueShift: 0 },
    glow: { enabled: true, amount: 15, threshold: 45, radius: 20 },
    chromatic: { enabled: true, amount: 3, angle: 90 },
    vignette: { enabled: true, amount: 35, softness: 55, roundness: 50, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 15, size: 1.5, mono: true },
    dither: { enabled: true, amount: 8 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 6: TOOL SECTIONS — Teal family
// Clear, intelligent, systematic. Frame Mode.
// ============================================
export const TOOLS_GRADIENT: GradientPreset = {
  gradientType: 'conic',
  colors: [
    { id: '1', color: '#122526', position: 0 },
    { id: '2', color: '#1C3C3D', position: 30 },
    { id: '3', color: '#41AAAE', position: 55 },
    { id: '4', color: '#73CBC4', position: 75 },
    { id: '5', color: '#150B49', position: 100 },
  ],
  angle: 0,
  conicSettings: {
    positionX: 50,
    positionY: 50,
    startAngle: 45,
    arc: 360,
    repeatCount: 1,
  },
  warps: {
    ...noWarps,
    sphere: { enabled: true, amount: 20, radius: 1.0, centerX: 50, centerY: 50 },
  },
  materials: {
    ...noMaterials,
    holographic: { enabled: true, intensity: 10, density: 12, angle: 60, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 0, contrast: 6, saturation: 5, hueShift: 0 },
    glow: { enabled: true, amount: 15, threshold: 50, radius: 20 },
    chromatic: { enabled: true, amount: 3, angle: 90 },
    vignette: { enabled: true, amount: 22, softness: 70, roundness: 60, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 8, size: 1.2, mono: true },
    dither: { enabled: true, amount: 10 },
    halftone: off,
    scanlines: { enabled: true, intensity: 5, density: 15 },
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 12: PHASE 5 BUILDING — Blue/Purple (blue end)
// Intense, electric, focused. Highest saturation.
// ============================================
export const BUILDING_GRADIENT: GradientPreset = {
  gradientType: 'spiral',
  colors: [
    { id: '1', color: '#150B49', position: 0 },
    { id: '2', color: '#1B0C6F', position: 20 },
    { id: '3', color: '#3500FF', position: 45 },
    { id: '4', color: '#41AAAE', position: 70 },
    { id: '5', color: '#00FFC5', position: 90 },
    { id: '6', color: '#150B49', position: 100 },
  ],
  angle: 0,
  spiralSettings: {
    tightness: 3,
    direction: 'cw',
    decay: 40,
    positionX: 50,
    positionY: 50,
    colorSpread: 80,
    armWidth: 50,
  },
  warps: {
    ...noWarps,
    twist: { enabled: true, amount: 30, radius: 1.2, centerX: 50, centerY: 50 },
    wave: { enabled: true, amount: 10, frequency: 4, direction: 'diagonal', rotation: 45 },
  },
  materials: {
    ...noMaterials,
    iridescent: { enabled: true, intensity: 18, scale: 3, shift: 120, blendMode: 'screen' },
    metallic: { enabled: true, intensity: 10, highlight: 60, contrast: 40, blendMode: 'overlay' },
  },
  effects: {
    color: { enabled: true, brightness: 5, contrast: 15, saturation: 15, hueShift: 0 },
    glow: { enabled: true, amount: 30, threshold: 30, radius: 35 },
    chromatic: { enabled: true, amount: 8, angle: 30 },
    vignette: { enabled: true, amount: 20, softness: 60, roundness: 50, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 8, size: 1, mono: true },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 15: WHEN THINGS GO WRONG — Gold (light) + Red (light)
// Warmest, softest palette. Comfort.
// ============================================
export const COMFORT_GRADIENT: GradientPreset = {
  gradientType: 'radial',
  colors: [
    { id: '1', color: '#DCA14C', position: 0 },
    { id: '2', color: '#FEF2E2', position: 30 },
    { id: '3', color: '#FFDCDB', position: 55 },
    { id: '4', color: '#F7D8AB', position: 75 },
    { id: '5', color: '#592D11', position: 100 },
  ],
  angle: 0,
  radialSettings: {
    positionX: 50,
    positionY: 45,
    scaleX: 1,
    scaleY: 1.2,
    zoom: 1,
    repeatMode: 'none',
    shape: 'circle',
    cornerRadius: 0,
    shapeAspect: 1,
  },
  warps: {
    ...noWarps,
    sphere: { enabled: true, amount: 15, radius: 1.0, centerX: 50, centerY: 45 },
  },
  materials: {
    ...noMaterials,
    velvet: { enabled: true, intensity: 25, depth: 30, glow: 40, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 10, contrast: -5, saturation: -5, hueShift: 0 },
    glow: { enabled: true, amount: 30, threshold: 25, radius: 40 },
    chromatic: { enabled: true, amount: 3, angle: 60 },
    vignette: { enabled: true, amount: 15, softness: 80, roundness: 70, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 12, size: 1.5, mono: true },
    dither: { enabled: true, amount: 15 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 4: HOW CODE LIVES — Blue/Purple (violet end)
// Deep, nocturnal jewel tones. Frame + Stage.
// ============================================
export const HOW_CODE_LIVES_GRADIENT: GradientPreset = {
  gradientType: 'radial',
  colors: [
    { id: '1', color: '#150B49', position: 0 },
    { id: '2', color: '#480C79', position: 30 },
    { id: '3', color: '#8C00FF', position: 55 },
    { id: '4', color: '#E4C7FC', position: 80 },
    { id: '5', color: '#680300', position: 100 },
  ],
  angle: 0,
  radialSettings: {
    positionX: 45,
    positionY: 40,
    scaleX: 1.2,
    scaleY: 1,
    zoom: 1,
    repeatMode: 'none',
    shape: 'circle',
    cornerRadius: 0,
    shapeAspect: 1,
  },
  warps: {
    ...noWarps,
    sphere: { enabled: true, amount: 22, radius: 0.85, centerX: 45, centerY: 40 },
    wave: { enabled: true, amount: 10, frequency: 2, direction: 'diagonal', rotation: 25 },
  },
  materials: {
    ...noMaterials,
    iridescent: { enabled: true, intensity: 15, scale: 2, shift: 80, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 2, contrast: 10, saturation: 8, hueShift: 0 },
    glow: { enabled: true, amount: 22, threshold: 35, radius: 28 },
    chromatic: { enabled: true, amount: 5, angle: 75 },
    vignette: { enabled: true, amount: 28, softness: 65, roundness: 55, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.3, mono: true },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 7: BEFORE YOU START — Red (terracotta)
// Grounding warmth. Earthy. Threshold moment.
// ============================================
export const BEFORE_YOU_START_GRADIENT: GradientPreset = {
  gradientType: 'linear',
  colors: [
    { id: '1', color: '#680300', position: 0 },
    { id: '2', color: '#8F0300', position: 30 },
    { id: '3', color: '#F5241F', position: 55 },
    { id: '4', color: '#DCA14C', position: 80 },
    { id: '5', color: '#592D11', position: 100 },
  ],
  angle: 155,
  warps: {
    ...noWarps,
    bend: { enabled: true, amount: 22, axis: 60, pinch: 12 },
  },
  materials: {
    ...noMaterials,
    velvet: { enabled: true, intensity: 20, depth: 45, glow: 20, blendMode: 'soft-light' },
  },
  effects: {
    color: { enabled: true, brightness: 0, contrast: 8, saturation: 5, hueShift: 0 },
    glow: { enabled: true, amount: 18, threshold: 40, radius: 25 },
    chromatic: { enabled: true, amount: 4, angle: 90 },
    vignette: { enabled: true, amount: 30, softness: 60, roundness: 50, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 12, size: 1.4, mono: true },
    dither: { enabled: true, amount: 10 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 8: PHASE 1 YOUR IDEA — Red (coral end)
// Bright, optimistic, energetic. Stage Mode.
// ============================================
export const PHASE1_IDEA_GRADIENT: GradientPreset = {
  gradientType: 'aurora',
  colors: [
    { id: '1', color: '#680300', position: 0 },
    { id: '2', color: '#F5241F', position: 30 },
    { id: '3', color: '#FFDCDB', position: 50 },
    { id: '4', color: '#E38227', position: 75 },
    { id: '5', color: '#FF00D4', position: 100 },
  ],
  angle: 60,
  auroraSettings: {
    waveCount: 3,
    flow: 55,
    softness: 65,
    verticalPosition: 50,
    rotation: 20,
    spread: 70,
    intensity: 85,
    blend: 55,
  },
  warps: {
    ...noWarps,
    wave: { enabled: true, amount: 15, frequency: 3, direction: 'diagonal', rotation: 35 },
  },
  materials: {
    ...noMaterials,
    iridescent: { enabled: true, intensity: 18, scale: 2, shift: 50, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 5, contrast: 12, saturation: 12, hueShift: 0 },
    glow: { enabled: true, amount: 25, threshold: 35, radius: 30 },
    chromatic: { enabled: true, amount: 6, angle: 45 },
    vignette: { enabled: true, amount: 20, softness: 60, roundness: 50, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 8, size: 1.2, mono: false },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 9: PHASE 2 RESEARCH — Teal family
// Oceanic, exploratory, deep. Mix shapes.
// ============================================
export const PHASE2_RESEARCH_GRADIENT: GradientPreset = {
  gradientType: 'linear',
  colors: [
    { id: '1', color: '#122526', position: 0 },
    { id: '2', color: '#1C3C3D', position: 25 },
    { id: '3', color: '#41AAAE', position: 50 },
    { id: '4', color: '#006653', position: 75 },
    { id: '5', color: '#091410', position: 100 },
  ],
  angle: 170,
  warps: {
    ...noWarps,
    sphere: { enabled: true, amount: 18, radius: 0.9, centerX: 55, centerY: 50 },
  },
  materials: {
    ...noMaterials,
    holographic: { enabled: true, intensity: 10, density: 10, angle: 45, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 0, contrast: 8, saturation: 6, hueShift: 0 },
    glow: { enabled: true, amount: 18, threshold: 45, radius: 22 },
    chromatic: { enabled: true, amount: 4, angle: 100 },
    vignette: { enabled: true, amount: 25, softness: 70, roundness: 60, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.3, mono: true },
    dither: { enabled: true, amount: 10 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 10: PHASE 3 THE SPEC — Blue/Purple (violet end)
// Authoritative, substantial, deep purple. Frame Mode.
// ============================================
export const PHASE3_SPEC_GRADIENT: GradientPreset = {
  gradientType: 'conic',
  colors: [
    { id: '1', color: '#150B49', position: 0 },
    { id: '2', color: '#480C79', position: 25 },
    { id: '3', color: '#8C00FF', position: 50 },
    { id: '4', color: '#3500FF', position: 75 },
    { id: '5', color: '#150B49', position: 100 },
  ],
  angle: 0,
  conicSettings: {
    positionX: 50,
    positionY: 50,
    startAngle: 60,
    arc: 360,
    repeatCount: 1,
  },
  warps: {
    ...noWarps,
    twist: { enabled: true, amount: 18, radius: 1.0, centerX: 50, centerY: 50 },
  },
  materials: {
    ...noMaterials,
    iridescent: { enabled: true, intensity: 12, scale: 2.5, shift: 90, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 2, contrast: 10, saturation: 8, hueShift: 0 },
    glow: { enabled: true, amount: 20, threshold: 38, radius: 26 },
    chromatic: { enabled: true, amount: 5, angle: 60 },
    vignette: { enabled: true, amount: 25, softness: 65, roundness: 55, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.2, mono: true },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: { enabled: true, intensity: 4, density: 12 },
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 11: PHASE 4 THE PLAN — Gold family
// Golden. Amber as architecture. Bright and structured.
// ============================================
export const PHASE4_PLAN_GRADIENT: GradientPreset = {
  gradientType: 'aurora',
  colors: [
    { id: '1', color: '#592D11', position: 0 },
    { id: '2', color: '#E38227', position: 25 },
    { id: '3', color: '#F9A223', position: 50 },
    { id: '4', color: '#DCA14C', position: 75 },
    { id: '5', color: '#680300', position: 100 },
  ],
  angle: 45,
  auroraSettings: {
    waveCount: 3,
    flow: 50,
    softness: 60,
    verticalPosition: 50,
    rotation: 10,
    spread: 65,
    intensity: 80,
    blend: 55,
  },
  warps: {
    ...noWarps,
    sphere: { enabled: true, amount: 20, radius: 0.9, centerX: 50, centerY: 50 },
    wave: { enabled: true, amount: 8, frequency: 2, direction: 'horizontal', rotation: 15 },
  },
  materials: {
    ...noMaterials,
    iridescent: { enabled: true, intensity: 15, scale: 2, shift: 40, blendMode: 'screen' },
    velvet: { enabled: true, intensity: 12, depth: 35, glow: 18, blendMode: 'soft-light' },
  },
  effects: {
    color: { enabled: true, brightness: 5, contrast: 10, saturation: 8, hueShift: 0 },
    glow: { enabled: true, amount: 22, threshold: 35, radius: 28 },
    chromatic: { enabled: true, amount: 5, angle: 50 },
    vignette: { enabled: true, amount: 25, softness: 60, roundness: 50, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 10, size: 1.3, mono: true },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 13: PHASE 6 DEPLOYMENT — Green family
// Go-signal green. Launch colors. Celebratory.
// ============================================
export const PHASE6_DEPLOY_GRADIENT: GradientPreset = {
  gradientType: 'aurora',
  colors: [
    { id: '1', color: '#091410', position: 0 },
    { id: '2', color: '#142819', position: 20 },
    { id: '3', color: '#1E7C40', position: 45 },
    { id: '4', color: '#78DB89', position: 70 },
    { id: '5', color: '#00FFC5', position: 90 },
    { id: '6', color: '#41AAAE', position: 100 },
  ],
  angle: 60,
  auroraSettings: {
    waveCount: 4,
    flow: 55,
    softness: 65,
    verticalPosition: 50,
    rotation: 20,
    spread: 70,
    intensity: 85,
    blend: 60,
  },
  warps: {
    ...noWarps,
    wave: { enabled: true, amount: 14, frequency: 3, direction: 'diagonal', rotation: 30 },
  },
  materials: {
    ...noMaterials,
    holographic: { enabled: true, intensity: 12, density: 10, angle: 45, blendMode: 'screen' },
  },
  effects: {
    color: { enabled: true, brightness: 5, contrast: 10, saturation: 10, hueShift: 0 },
    glow: { enabled: true, amount: 25, threshold: 35, radius: 30 },
    chromatic: { enabled: true, amount: 5, angle: 60 },
    vignette: { enabled: true, amount: 20, softness: 65, roundness: 55, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 8, size: 1.2, mono: false },
    dither: { enabled: true, amount: 12 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 14: PHASE 7 MAINTENANCE — Teal (desaturated)
// Muted, steady, mature. Lowest intensity of phase sections.
// ============================================
export const PHASE7_MAINTENANCE_GRADIENT: GradientPreset = {
  gradientType: 'linear',
  colors: [
    { id: '1', color: '#122526', position: 0 },
    { id: '2', color: '#1C3C3D', position: 35 },
    { id: '3', color: '#41AAAE', position: 60 },
    { id: '4', color: '#E4C7FC', position: 85 },
    { id: '5', color: '#EEEBFF', position: 100 },
  ],
  angle: 175,
  warps: {
    ...noWarps,
    bend: { enabled: true, amount: 12, axis: 0, pinch: 6 },
  },
  materials: noMaterials,
  effects: {
    color: { enabled: true, brightness: -3, contrast: 5, saturation: -15, hueShift: 0 },
    glow: { enabled: true, amount: 12, threshold: 50, radius: 18 },
    chromatic: { enabled: true, amount: 2, angle: 90 },
    vignette: { enabled: true, amount: 30, softness: 70, roundness: 60, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 12, size: 1.5, mono: true },
    dither: { enabled: true, amount: 10 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

// ============================================
// SECTION 16: GLOSSARY — Neutral
// Near-neutral. Clean, functional, scannable. Minimal gradient.
// ============================================
export const GLOSSARY_GRADIENT: GradientPreset = {
  gradientType: 'linear',
  colors: [
    { id: '1', color: '#F9F9F9', position: 0 },
    { id: '2', color: '#EEEBFF', position: 40 },
    { id: '3', color: '#E4C7FC', position: 70 },
    { id: '4', color: '#F9F9F9', position: 100 },
  ],
  angle: 180,
  warps: noWarps,
  materials: noMaterials,
  effects: {
    color: { enabled: true, brightness: 10, contrast: -5, saturation: -20, hueShift: 0 },
    glow: { enabled: true, amount: 10, threshold: 55, radius: 15 },
    chromatic: { enabled: true, amount: 2, angle: 120 },
    vignette: { enabled: true, amount: 10, softness: 80, roundness: 70, invert: false },
    posterize: off,
    grain: { enabled: true, amount: 6, size: 1, mono: true },
    dither: { enabled: true, amount: 8 },
    halftone: off,
    scanlines: off,
    pixelate: off,
  },
  geometry: noGeometry,
}

/**
 * BREATH transition gradient — crossfade between two section palettes.
 * Takes outgoing and incoming deepest colors.
 */
export function createBreathGradient(
  outgoingDeep: string,
  bridgeColor: string,
  incomingDeep: string,
): GradientPreset {
  return {
    gradientType: 'linear',
    colors: [
      { id: '1', color: outgoingDeep, position: 0 },
      { id: '2', color: bridgeColor, position: 50 },
      { id: '3', color: incomingDeep, position: 100 },
    ],
    angle: 180,
    warps: noWarps,
    materials: noMaterials,
    effects: {
      color: { enabled: true, brightness: 0, contrast: 5, saturation: 0, hueShift: 0 },
      glow: { enabled: true, amount: 15, threshold: 40, radius: 22 },
      chromatic: { enabled: true, amount: 3, angle: 90 },
      vignette: { enabled: true, amount: 20, softness: 70, roundness: 60, invert: false },
      posterize: off,
      grain: { enabled: true, amount: 8, size: 1.5, mono: true },
      dither: { enabled: true, amount: 10 },
      halftone: off,
      scanlines: off,
      pixelate: off,
    },
    geometry: noGeometry,
  }
}

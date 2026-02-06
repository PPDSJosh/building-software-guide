/**
 * Gradient type definitions — extracted from GradientLab's gradientStore.
 * These types define the complete shape of a gradient configuration.
 */

// === COLOR ===
export interface ColorStop {
  id: string
  color: string    // Hex color like "#FF0000"
  position: number // 0-100
}

// === EFFECTS (Post-processing adjustments) ===

export interface ColorAdjustmentSettings {
  enabled: boolean
  brightness: number    // -100 to 100
  contrast: number      // -100 to 100
  saturation: number    // -100 to 100
  hueShift: number      // 0 to 360
}

export interface GlowSettings {
  enabled: boolean
  amount: number        // 0 to 100
  threshold: number     // 0 to 100
  radius: number        // 0 to 100
}

export interface ChromaticAberrationSettings {
  enabled: boolean
  amount: number        // 0 to 100
  angle: number         // 0 to 360
}

export interface VignetteSettings {
  enabled: boolean
  amount: number        // 0 to 100
  softness: number      // 0 to 100
  roundness: number     // 0 to 100
  invert: boolean
}

export interface PosterizeSettings {
  enabled: boolean
  levels: number        // 2 to 32
}

export interface GrainSettings {
  enabled: boolean
  amount: number        // 0 to 100
  size: number          // 1 to 5
  mono: boolean
}

export interface DitherSettings {
  enabled: boolean
  amount: number        // 0 to 100
}

export interface HalftoneSettings {
  enabled: boolean
  intensity: number     // 0-100
  scale: number         // 20-80
  softness: number      // 0-100
}

export interface ScanlinesSettings {
  enabled: boolean
  intensity: number     // 0 to 100
  density: number       // 1 to 20
}

export interface PixelateSettings {
  enabled: boolean
  size: number          // 1 to 100
}

export type AsciiPreset = 'custom' | 'classic' | 'minimal' | 'blocks' | 'binary' | 'braille'
export type AsciiColorMode = 'colored' | 'mono'

export interface AsciiShadowSettings {
  enabled: boolean
  color: string
  offsetX: number
  offsetY: number
  blur: number
}

export interface AsciiGlowSettings {
  enabled: boolean
  amount: number
  radius: number
}

export interface AsciiPerspectiveSettings {
  enabled: boolean
  tiltX: number
  tiltY: number
}

export interface AsciiEdgeSettings {
  enabled: boolean
  threshold: number
}

export interface AsciiSettings {
  enabled: boolean
  characters: string
  preset: AsciiPreset
  density: number
  colorMode: AsciiColorMode
  monoColor: string
  backgroundColor: string
  invert: boolean
  lockGrid: boolean
  rotation: number
  lineHeight: number
  letterSpacing: number
  shadow: AsciiShadowSettings
  glow: AsciiGlowSettings
  perspective: AsciiPerspectiveSettings
  edge: AsciiEdgeSettings
  customFont: string | null
  customFontName: string | null
}

export type DotMatrixShape = 'circle' | 'square' | 'diamond'
export type DotMatrixColorMode = 'colored' | 'mono' | 'duotone'

export interface DotMatrixSettings {
  enabled: boolean
  shape: DotMatrixShape
  density: number
  sizeMin: number
  sizeMax: number
  colorMode: DotMatrixColorMode
  monoColor: string
  duotoneDark: string
  duotoneLight: string
  backgroundColor: string
  softness: number
  invert: boolean
  lockGrid: boolean
  gap: number
  texture: number
  perspective: {
    enabled: boolean
    tiltX: number
    tiltY: number
  }
}

export interface EffectsState {
  color: ColorAdjustmentSettings
  glow: GlowSettings
  chromatic: ChromaticAberrationSettings
  vignette: VignetteSettings
  posterize: PosterizeSettings
  grain: GrainSettings
  dither: DitherSettings
  halftone: HalftoneSettings
  scanlines: ScanlinesSettings
  pixelate: PixelateSettings
  ascii: AsciiSettings
  dotMatrix: DotMatrixSettings
}

// === REPEAT / BLEND ===
export type RepeatMode = 'none' | 'repeat' | 'mirror'
export type BlendStyle = 'normal' | 'soft' | 'vivid'

// === GRADIENT TYPE SETTINGS ===
export interface LinearSettings {
  offsetX: number
  offsetY: number
  scale: number
  repeatMode: RepeatMode
}

export type RadialShape = 'circle' | 'roundedRect' | 'squircle' | 'pill'

export interface RadialSettings {
  positionX: number
  positionY: number
  scaleX: number
  scaleY: number
  zoom: number
  repeatMode: RepeatMode
  shape: RadialShape
  cornerRadius: number
  shapeAspect: number
}

export interface ConicSettings {
  positionX: number
  positionY: number
  startAngle: number
  arc: number
  repeatCount: number
}

export interface DiamondSettings {
  positionX: number
  positionY: number
  scaleX: number
  scaleY: number
  zoom: number
  rotation: number
  repeatMode: RepeatMode
  blendStyle: BlendStyle
}

export interface SpiralSettings {
  tightness: number
  direction: 'cw' | 'ccw'
  decay: number
  positionX: number
  positionY: number
  colorSpread: number
  armWidth: number
}

export interface AuroraSettings {
  waveCount: number
  flow: number
  softness: number
  verticalPosition: number
  rotation: number
  spread: number
  intensity: number
  blend: number
}

export interface StripesSettings {
  stripeCount: number
  angle: number
  sharpness: number
  fade: number
  offset: number
}

export type FoldedStyle = 'accordion' | 'waves' | 'zigzag'

export interface FoldedSettings {
  foldCount: number
  foldAngle: number
  lightDirection: number
  softness: number
  depth: number
  style: FoldedStyle
}

export type BlendEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce'
export type HuePath = 'linear' | 'short' | 'long'

export interface BlendOptions {
  hardStops: boolean
  steps: number
  easing: BlendEasing
  huePath: HuePath
}

export type ReverbShape = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star' | 'diamond' | 'heart'
export type ReverbSpacing = 'tight' | 'medium' | 'wide' | 'sparse'

export interface ReverbSettings {
  shape: ReverbShape
  rings: number
  spacing: ReverbSpacing
  thickness: number
  zoom: number
  decay: number
  blend: number
  positionX: number
  positionY: number
}

// === MATERIALS ===
export type MaterialBlendMode =
  | 'normal' | 'screen' | 'overlay' | 'multiply'
  | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn'
  | 'lighten' | 'darken'

export interface IridescentSettings {
  enabled: boolean
  intensity: number
  scale: number
  shift: number
  blendMode: MaterialBlendMode
}

export interface MetallicSettings {
  enabled: boolean
  intensity: number
  highlight: number
  contrast: number
  blendMode: MaterialBlendMode
}

export interface HolographicSettings {
  enabled: boolean
  intensity: number
  density: number
  angle: number
  blendMode: MaterialBlendMode
}

export interface VelvetSettings {
  enabled: boolean
  intensity: number
  depth: number
  glow: number
  blendMode: MaterialBlendMode
}

export interface MaterialState {
  iridescent: IridescentSettings
  metallic: MetallicSettings
  holographic: HolographicSettings
  velvet: VelvetSettings
}

// === WARPS (UV Distortion) ===
export type WarpDirection = 'horizontal' | 'vertical' | 'diagonal'

export interface BendWarpSettings {
  enabled: boolean
  amount: number
  axis: number
  pinch: number
}

export interface TwistWarpSettings {
  enabled: boolean
  amount: number
  radius: number
  centerX: number
  centerY: number
}

export interface SphereWarpSettings {
  enabled: boolean
  amount: number
  radius: number
  centerX: number
  centerY: number
}

export interface WaveWarpSettings {
  enabled: boolean
  amplitude: number
  frequency: number
  direction: WarpDirection
  rotation: number
}

export interface BulgeWarpSettings {
  enabled: boolean
  amount: number
  radius: number
  centerX: number
  centerY: number
}

export interface RippleWarpSettings {
  enabled: boolean
  amplitude: number
  frequency: number
  centerX: number
  centerY: number
  decay: number
  rotation: number
}

export interface WarpBlurSettings {
  enabled: boolean
  amount: number
}

export interface WarpState {
  bend: BendWarpSettings
  twist: TwistWarpSettings
  sphere: SphereWarpSettings
  wave: WaveWarpSettings
  bulge: BulgeWarpSettings
  ripple: RippleWarpSettings
  blur: WarpBlurSettings
}

// === GEOMETRY EFFECTS ===
export type ColumnPattern = 'alternating' | 'progressive' | 'wave'

export interface GridRefractionSettings {
  enabled: boolean
  tilesX: number
  tilesY: number
  refraction: number
  angle: number
  variation: number
  meshBulge: number
  meshSkewX: number
  meshSkewY: number
  meshPerspective: number
  meshPerspectiveAngle: number
  meshCurve: number
  meshCurveAxis: number
  meshWave: number
  meshWaveFreq: number
  meshWaveAngle: number
  meshTwist: number
}

export interface ColumnRefractionSettings {
  enabled: boolean
  count: number
  offset: number
  angle: number
  perspective: number
  pattern: ColumnPattern
  meshBulge: number
  meshSkewX: number
  meshSkewY: number
  meshCurve: number
  meshCurveAxis: number
  meshWave: number
  meshWaveFreq: number
  meshWaveAngle: number
  meshTwist: number
}

export type SurfaceType = 'sphere' | 'cylinder' | 'saddle'

export interface DepthSettings {
  enabled: boolean
  amount: number
  centerX: number
  centerY: number
  falloff: number
  shading: boolean
  surfaceType: SurfaceType
  surfaceWave: number
  waveScale: number
}

export interface GeometryEffectsState {
  grid: GridRefractionSettings
  columns: ColumnRefractionSettings
  depth: DepthSettings
}

// === GRADIENT TYPE ===
export type GradientType = 'linear' | 'radial' | 'conic' | 'diamond' | 'spiral' | 'aurora' | 'stripes' | 'folded' | 'reverb'

// === FULL GRADIENT STATE ===
export interface GradientState {
  colorStops: ColorStop[]
  gradientType: GradientType
  angle: number
  centerX: number
  centerY: number

  gradientOffset: number
  gradientScale: number
  animColorSpread: number
  colorCycle: number
  gradientCenterX: number
  gradientCenterY: number
  innerRadius: number
  outerRadius: number
  conicOffset: number

  blendOptions: BlendOptions

  linearSettings: LinearSettings
  radialSettings: RadialSettings
  conicSettings: ConicSettings
  diamondSettings: DiamondSettings

  spiralSettings: SpiralSettings
  auroraSettings: AuroraSettings
  stripesSettings: StripesSettings
  foldedSettings: FoldedSettings
  reverbSettings: ReverbSettings

  geometryType: 'none' | 'grid' | 'verticalStripes' | 'horizontalBars' | 'diagonalStripes'
  geometryCount: number
  geometryRows: number
  geometryGap: number
  geometryRotation: number
  geometryJitter: number
  geometryShadow: number
  geometryRounded: boolean
  geometryOffset: number

  geometryEffects: GeometryEffectsState

  warp: WarpState
  warpMuted: boolean
  savedWarpStates: {
    bend: boolean
    wave: boolean
    ripple: boolean
    twist: boolean
    sphere: boolean
    bulge: boolean
    blur: boolean
  } | null

  isAnimating: boolean
  animationSpeed: number
  animationTarget: 'warp' | 'colors' | 'geometry' | 'all'

  _animationOverrides: Record<string, number> | null

  materials: MaterialState
  effects: EffectsState

  canvasWidth: number
  canvasHeight: number
  backgroundColor: string

  name: string
}

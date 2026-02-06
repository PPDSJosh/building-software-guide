/**
 * StandaloneGradientRenderer
 * 
 * Renders gradients from GradientState data without requiring the editor canvas.
 * Used for exporting from library, dashboard, and public share pages.
 * 
 * IMPORTANT: This must apply ALL effects exactly as the editor does:
 * - Gradient type and type-specific settings
 * - Colors and blend options
 * - Warps (bend, wave, ripple, twist, sphere, bulge, blur)
 * - Materials (iridescent, metallic, holographic, velvet)
 * - Effects (color, glow, chromatic, vignette, posterize, grain, dither, halftone, scanlines, pixelate)
 * - Geometry effects (grid, columns, depth)
 */

import { GradientEngine } from './GradientEngine'
import type {
  WarpState,
  MaterialState,
  EffectsState,
  GeometryEffectsState,
  BendWarpSettings,
  TwistWarpSettings,
  SphereWarpSettings,
  WaveWarpSettings,
  BulgeWarpSettings,
  RippleWarpSettings,
  WarpBlurSettings,
  IridescentSettings,
  MetallicSettings,
  HolographicSettings,
  VelvetSettings,
  ColorAdjustmentSettings,
  GlowSettings,
  ChromaticAberrationSettings,
  VignetteSettings,
  PosterizeSettings,
  GrainSettings,
  DitherSettings,
  HalftoneSettings,
  ScanlinesSettings,
  PixelateSettings,
  AsciiSettings,
  DotMatrixSettings,
  GridRefractionSettings,
  ColumnRefractionSettings,
  DepthSettings,
  LinearSettings,
  RadialSettings,
  ConicSettings,
  DiamondSettings,
  SpiralSettings,
  AuroraSettings,
  StripesSettings,
  FoldedSettings,
  ReverbSettings,
  BlendOptions,
} from '@/types/gradient'

/**
 * DatabaseGradientState is a loose type for gradient data that may come from
 * database storage or preset definitions. Uses `any`-style access patterns
 * because field names may differ between versions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DatabaseGradientState = any

interface RenderOptions {
  width: number
  height: number
  format?: 'png' | 'jpg' | 'webp'
  quality?: number
}

/**
 * Renders a gradient state to a Blob image
 */
export async function renderGradientToBlob(
  state: DatabaseGradientState,
  options: RenderOptions
): Promise<Blob> {
  const { width, height, format = 'png', quality = 0.92 } = options
  
  // Create an offscreen canvas for WebGL rendering
  const glCanvas = document.createElement('canvas')
  glCanvas.width = width
  glCanvas.height = height
  
  // Create gradient engine with the offscreen canvas
  let engine: GradientEngine
  try {
    engine = new GradientEngine(glCanvas)
  } catch (initError) {
    console.error('[StandaloneRenderer] Failed to create GradientEngine:', initError)
    throw new Error('Failed to initialize WebGL renderer')
  }
  
  try {
    // CRITICAL: Set pixel ratio to 1 for standalone rendering
    // The GradientEngine defaults to window.devicePixelRatio which would make the
    // framebuffer 2x larger on Retina displays, causing readPixels to only get
    // a quarter of the image (bottom-left quarter since WebGL is bottom-to-top)
    engine.getRenderer().setPixelRatio(1)
    
    // Apply ALL state to the engine - be meticulous!
    applyFullStateToEngine(engine, state)
    
    // Set the render target size - this also sets the aspect ratio uniform
    engine.handleResize(width, height)
    
    // Render the gradient
    engine.render()
    
    // Read pixels from WebGL context and draw to a 2D canvas
    // This ensures we can properly export the WebGL content
    const gl = engine.getRenderer().getContext() as WebGL2RenderingContext
    const pixels = new Uint8Array(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    
    // Create a 2D canvas and flip the pixels (WebGL is bottom-to-top)
    const canvas2d = document.createElement('canvas')
    canvas2d.width = width
    canvas2d.height = height
    const ctx = canvas2d.getContext('2d')!
    
    // Flip vertically when creating ImageData
    const flipped = new Uint8ClampedArray(width * height * 4)
    for (let y = 0; y < height; y++) {
      const srcRow = (height - y - 1) * width * 4
      const dstRow = y * width * 4
      for (let x = 0; x < width * 4; x++) {
        flipped[dstRow + x] = pixels[srcRow + x]
      }
    }
    
    const imageData = new ImageData(flipped, width, height)
    ctx.putImageData(imageData, 0, 0)
    
    // Convert to blob from the 2D canvas
    const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg'
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas2d.toBlob(
        (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
        mimeType,
        quality
      )
    })
    
    return blob
  } finally {
    // Clean up
    engine.dispose()
  }
}

/**
 * Renders a gradient state to a data URL
 */
export async function renderGradientToDataURL(
  state: DatabaseGradientState,
  options: RenderOptions
): Promise<string> {
  const blob = await renderGradientToBlob(state, options)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Renders a gradient and triggers download
 */
export async function renderAndDownloadGradient(
  state: DatabaseGradientState,
  options: RenderOptions & { filename: string }
): Promise<void> {
  const { filename, ...renderOptions } = options
  const format = renderOptions.format || 'png'
  
  const blob = await renderGradientToBlob(state, renderOptions)
  
  // Download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.${format}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Apply FULL database GradientState to the engine
 * This is the critical function that must map ALL settings correctly
 * Exported for use by ThumbnailPreview and other components
 */
export function applyFullStateToEngine(engine: GradientEngine, state: DatabaseGradientState): void {
  // 1. Set gradient type FIRST (this creates the correct shader)
  engine.setGradientType(state.gradientType)
  
  // 2. Set colors
  if (state.colors && state.colors.length > 0) {
    engine.setColorStops(state.colors)
  }
  
  // 3. Set angle
  engine.setAngle(state.angle ?? 0)
  
  // 4. Apply gradient-type-specific settings
  applyGradientTypeSettings(engine, state)
  
  // 5. Apply warps (CRITICAL - must handle all warp types)
  applyWarpSettings(engine, state)
  
  // 6. Apply materials (CRITICAL - must handle all material types)
  applyMaterialSettings(engine, state)
  
  // 7. Apply effects (post-processing)
  applyEffectsSettings(engine, state)
  
  // 8. Apply geometry effects
  applyGeometrySettings(engine, state)
  
  // 9. Apply blend options if present
  if ((state as any).blendOptions) {
    engine.setBlendOptions((state as any).blendOptions as BlendOptions)
  }
}

/**
 * Apply gradient-type-specific settings
 */
function applyGradientTypeSettings(engine: GradientEngine, state: DatabaseGradientState): void {
  const s = state as any
  
  switch (state.gradientType) {
    case 'linear':
      if (s.linearSettings) {
        engine.setLinearSettings(s.linearSettings as LinearSettings)
      }
      break
      
    case 'radial':
      if (s.radialSettings) {
        engine.setRadialSettings(s.radialSettings as RadialSettings)
      }
      break
      
    case 'conic':
      if (s.conicSettings) {
        engine.setConicSettings(s.conicSettings as ConicSettings)
      }
      break
      
    case 'diamond':
      if (s.diamondSettings) {
        engine.setDiamondSettings(s.diamondSettings as DiamondSettings)
      }
      break
      
    case 'spiral':
      if (s.spiralSettings) {
        engine.setSpiralSettings(s.spiralSettings as SpiralSettings)
      }
      break
      
    case 'aurora':
      if (s.auroraSettings) {
        engine.setAuroraSettings(s.auroraSettings as AuroraSettings)
      }
      break
      
    case 'stripes':
      if (s.stripesSettings) {
        engine.setStripesSettings(s.stripesSettings as StripesSettings)
      }
      break
      
    case 'folded':
      if (s.foldedSettings) {
        engine.setFoldedSettings(s.foldedSettings as FoldedSettings)
      }
      break
      
    case 'reverb':
      if (s.reverbSettings) {
        engine.setReverbSettings(s.reverbSettings as ReverbSettings)
      }
      break
  }
}

/**
 * Apply warp settings - CRITICAL for visual effects
 * Database stores: warps.wave.amount, warps.ripple.amount
 * Engine expects: amplitude for wave/ripple
 */
function applyWarpSettings(engine: GradientEngine, state: DatabaseGradientState): void {
  if (!state.warps) return
  
  const dbWarps = state.warps
  
  // Build the WarpState object that the engine expects
  const warpState: WarpState = {
    bend: buildBendSettings(dbWarps.bend),
    twist: buildTwistSettings(dbWarps.twist),
    sphere: buildSphereSettings(dbWarps.sphere),
    wave: buildWaveSettings(dbWarps.wave),
    bulge: buildBulgeSettings(dbWarps.bulge),
    ripple: buildRippleSettings(dbWarps.ripple),
    blur: buildBlurSettings(dbWarps.blur),
  }
  
  // Check if warps are muted - if so, disable all
  if (dbWarps.isMuted) {
    warpState.bend.enabled = false
    warpState.twist.enabled = false
    warpState.sphere.enabled = false
    warpState.wave.enabled = false
    warpState.bulge.enabled = false
    warpState.ripple.enabled = false
    warpState.blur.enabled = false
  }
  
  engine.setWarpSettings(warpState)
}

function buildBendSettings(db: any): BendWarpSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    axis: db?.axis ?? 0,
    pinch: db?.pinch ?? 0,
  }
}

function buildTwistSettings(db: any): TwistWarpSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    radius: db?.radius ?? 1,
    centerX: db?.centerX ?? 50,
    centerY: db?.centerY ?? 50,
  }
}

function buildSphereSettings(db: any): SphereWarpSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    radius: db?.radius ?? 0.7,
    centerX: db?.centerX ?? 50,
    centerY: db?.centerY ?? 50,
  }
}

// CRITICAL FIX: Database stores "amount" but engine expects "amplitude"
function buildWaveSettings(db: any): WaveWarpSettings {
  return {
    enabled: db?.enabled ?? false,
    amplitude: db?.amount ?? db?.amplitude ?? 0, // Try both field names
    frequency: db?.frequency ?? 3,
    direction: db?.direction ?? 'horizontal',
    rotation: db?.rotation ?? 0,
  }
}

function buildBulgeSettings(db: any): BulgeWarpSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    radius: db?.radius ?? 0.5,
    centerX: db?.centerX ?? 50,
    centerY: db?.centerY ?? 50,
  }
}

// CRITICAL FIX: Database stores "amount" but engine expects "amplitude"
function buildRippleSettings(db: any): RippleWarpSettings {
  return {
    enabled: db?.enabled ?? false,
    amplitude: db?.amount ?? db?.amplitude ?? 0, // Try both field names
    frequency: db?.frequency ?? 5,
    centerX: db?.centerX ?? 50,
    centerY: db?.centerY ?? 50,
    decay: db?.decay ?? 50,
    rotation: db?.rotation ?? 0,
  }
}

function buildBlurSettings(db: any): WarpBlurSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
  }
}

/**
 * Apply material settings - CRITICAL for visual quality
 */
function applyMaterialSettings(engine: GradientEngine, state: DatabaseGradientState): void {
  if (!state.materials) return
  
  const dbMats = state.materials
  
  const materialState: MaterialState = {
    iridescent: buildIridescentSettings(dbMats.iridescent),
    metallic: buildMetallicSettings(dbMats.metallic),
    holographic: buildHolographicSettings(dbMats.holographic),
    velvet: buildVelvetSettings(dbMats.velvet),
  }
  
  engine.setMaterialSettings(materialState)
}

function buildIridescentSettings(db: any): IridescentSettings {
  return {
    enabled: db?.enabled ?? false,
    intensity: db?.intensity ?? 0,
    scale: db?.scale ?? 1,
    shift: db?.shift ?? 0,
    blendMode: db?.blendMode ?? 'normal',
  }
}

function buildMetallicSettings(db: any): MetallicSettings {
  return {
    enabled: db?.enabled ?? false,
    intensity: db?.intensity ?? 0,
    highlight: db?.highlight ?? 50,
    contrast: db?.contrast ?? 50,
    blendMode: db?.blendMode ?? 'normal',
  }
}

function buildHolographicSettings(db: any): HolographicSettings {
  return {
    enabled: db?.enabled ?? false,
    intensity: db?.intensity ?? 0,
    density: db?.density ?? 50,
    angle: db?.angle ?? 45,
    blendMode: db?.blendMode ?? 'normal',
  }
}

function buildVelvetSettings(db: any): VelvetSettings {
  return {
    enabled: db?.enabled ?? false,
    intensity: db?.intensity ?? 0,
    depth: db?.depth ?? 50,
    glow: db?.glow ?? 30,
    blendMode: db?.blendMode ?? 'normal',
  }
}

/**
 * Apply effects settings (post-processing)
 */
function applyEffectsSettings(engine: GradientEngine, state: DatabaseGradientState): void {
  if (!state.effects) return
  
  const dbEffects = state.effects
  
  const effectsState: EffectsState = {
    color: buildColorSettings(dbEffects.color),
    glow: buildGlowSettings(dbEffects.glow),
    chromatic: buildChromaticSettings(dbEffects.chromatic),
    vignette: buildVignetteSettings(dbEffects.vignette),
    posterize: buildPosterizeSettings(dbEffects.posterize),
    grain: buildGrainSettings(dbEffects.grain),
    dither: buildDitherSettings(dbEffects.dither),
    halftone: buildHalftoneSettings(dbEffects.halftone),
    scanlines: buildScanlinesSettings(dbEffects.scanlines),
    pixelate: buildPixelateSettings(dbEffects.pixelate),
    ascii: buildAsciiSettings(dbEffects.ascii),
    dotMatrix: buildDotMatrixSettings(dbEffects.dotMatrix),
  }
  
  engine.setEffectsSettings(effectsState)
}

function buildColorSettings(db: any): ColorAdjustmentSettings {
  return {
    enabled: db?.enabled ?? false,
    brightness: db?.brightness ?? 0,
    contrast: db?.contrast ?? 0,
    saturation: db?.saturation ?? 0,
    hueShift: db?.hueShift ?? db?.hueRotation ?? 0,
  }
}

function buildGlowSettings(db: any): GlowSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    threshold: db?.threshold ?? 50,
    radius: db?.radius ?? 20,
  }
}

function buildChromaticSettings(db: any): ChromaticAberrationSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    angle: db?.angle ?? 0,
  }
}

function buildVignetteSettings(db: any): VignetteSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    softness: db?.softness ?? 50,
    roundness: db?.roundness ?? 50,
    invert: db?.invert ?? false,
  }
}

function buildPosterizeSettings(db: any): PosterizeSettings {
  return {
    enabled: db?.enabled ?? false,
    levels: db?.levels ?? 8,
  }
}

function buildGrainSettings(db: any): GrainSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    size: db?.size ?? 1,
    mono: db?.mono ?? db?.colored === false,
  }
}

function buildDitherSettings(db: any): DitherSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
  }
}

function buildHalftoneSettings(db: any): HalftoneSettings {
  return {
    enabled: db?.enabled ?? false,
    intensity: db?.intensity ?? 50,
    scale: db?.scale ?? 50,
    softness: db?.softness ?? 50,
  }
}

function buildScanlinesSettings(db: any): ScanlinesSettings {
  return {
    enabled: db?.enabled ?? false,
    intensity: db?.intensity ?? db?.opacity ?? 20,
    density: db?.density ?? 10,
  }
}

function buildPixelateSettings(db: any): PixelateSettings {
  return {
    enabled: db?.enabled ?? false,
    size: db?.size ?? 4,
  }
}

function buildAsciiSettings(db: any): AsciiSettings {
  return {
    enabled: db?.enabled ?? false,
    characters: db?.characters ?? 'GradientLab',
    preset: db?.preset ?? 'custom',
    density: db?.density ?? 80,
    colorMode: db?.colorMode ?? 'colored',
    monoColor: db?.monoColor ?? '#ffffff',
    backgroundColor: db?.backgroundColor ?? '#0a0a0a',
    invert: db?.invert ?? false,
    lockGrid: db?.lockGrid ?? false,
    rotation: db?.rotation ?? 0,
    lineHeight: db?.lineHeight ?? 100,
    letterSpacing: db?.letterSpacing ?? 100,
    shadow: db?.shadow ?? { enabled: false, color: '#000000', offsetX: 2, offsetY: 2, blur: 0 },
    glow: db?.glow ?? { enabled: false, amount: 50, radius: 30 },
    perspective: db?.perspective ?? { enabled: false, tiltX: 0, tiltY: 0 },
    edge: db?.edge ?? { enabled: false, threshold: 50 },
    customFont: db?.customFont ?? null,
    customFontName: db?.customFontName ?? null,
  }
}

function buildDotMatrixSettings(db: any): DotMatrixSettings {
  return {
    enabled: db?.enabled ?? false,
    shape: db?.shape ?? 'circle',
    density: db?.density ?? 60,
    sizeMin: db?.sizeMin ?? 10,
    sizeMax: db?.sizeMax ?? 100,
    colorMode: db?.colorMode ?? 'colored',
    monoColor: db?.monoColor ?? '#ffffff',
    duotoneDark: db?.duotoneDark ?? '#0a0a0a',
    duotoneLight: db?.duotoneLight ?? '#ffffff',
    backgroundColor: db?.backgroundColor ?? '#0a0a0a',
    softness: db?.softness ?? 0,
    invert: db?.invert ?? false,
    lockGrid: db?.lockGrid ?? false,
    gap: db?.gap ?? 0,
    texture: db?.texture ?? 0,
    perspective: {
      enabled: db?.perspective?.enabled ?? false,
      tiltX: db?.perspective?.tiltX ?? 0,
      tiltY: db?.perspective?.tiltY ?? 0,
    },
  }
}

/**
 * Apply geometry effects settings
 * Database stores at: state.geometry.effects.{grid,columns,depth}
 */
function applyGeometrySettings(engine: GradientEngine, state: DatabaseGradientState): void {
  if (!state.geometry?.effects) return
  
  const dbGeom = state.geometry.effects
  
  const geomState: GeometryEffectsState = {
    grid: buildGridSettings(dbGeom.grid),
    columns: buildColumnSettings(dbGeom.columns),
    depth: buildDepthSettings(dbGeom.depth),
  }
  
  engine.setGeometryEffectsSettings(geomState)
}

function buildGridSettings(db: any): GridRefractionSettings {
  return {
    enabled: db?.enabled ?? false,
    tilesX: db?.tilesX ?? 4,
    tilesY: db?.tilesY ?? 4,
    refraction: db?.refraction ?? 0,
    angle: db?.angle ?? 0,
    variation: db?.variation ?? 0,
    // Mesh deformation - use defaults if not saved
    meshBulge: db?.meshBulge ?? 0,
    meshSkewX: db?.meshSkewX ?? 0,
    meshSkewY: db?.meshSkewY ?? 0,
    meshPerspective: db?.meshPerspective ?? 0,
    meshPerspectiveAngle: db?.meshPerspectiveAngle ?? 0,
    meshCurve: db?.meshCurve ?? 0,
    meshCurveAxis: db?.meshCurveAxis ?? 0,
    meshWave: db?.meshWave ?? 0,
    meshWaveFreq: db?.meshWaveFreq ?? 2,
    meshWaveAngle: db?.meshWaveAngle ?? 0,
    meshTwist: db?.meshTwist ?? 0,
  }
}

function buildColumnSettings(db: any): ColumnRefractionSettings {
  return {
    enabled: db?.enabled ?? false,
    count: db?.count ?? 6,
    offset: db?.offset ?? 0,
    angle: db?.angle ?? 0,
    perspective: db?.perspective ?? 0,
    pattern: db?.pattern ?? 'alternating',
    // Mesh deformation - use defaults if not saved
    meshBulge: db?.meshBulge ?? 0,
    meshSkewX: db?.meshSkewX ?? 0,
    meshSkewY: db?.meshSkewY ?? 0,
    meshCurve: db?.meshCurve ?? 0,
    meshCurveAxis: db?.meshCurveAxis ?? 0,
    meshWave: db?.meshWave ?? 0,
    meshWaveFreq: db?.meshWaveFreq ?? 2,
    meshWaveAngle: db?.meshWaveAngle ?? 0,
    meshTwist: db?.meshTwist ?? 0,
  }
}

function buildDepthSettings(db: any): DepthSettings {
  return {
    enabled: db?.enabled ?? false,
    amount: db?.amount ?? 0,
    centerX: db?.centerX ?? 50,
    centerY: db?.centerY ?? 50,
    falloff: db?.falloff ?? 50,
    shading: db?.shading ?? false,
    // Dimensionality - use defaults if not saved
    surfaceType: db?.surfaceType ?? 'sphere',
    surfaceWave: db?.surfaceWave ?? 0,
    waveScale: db?.waveScale ?? 2,
  }
}

/**
 * Get pixel data for high-resolution export
 * Returns a callback compatible with exportManager
 */
export function createRenderCallback(state: DatabaseGradientState) {
  return async (width: number, height: number, _time?: number): Promise<Uint8Array> => {
    // Create an offscreen canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    
    // Create gradient engine with the offscreen canvas
    const engine = new GradientEngine(canvas)
    
    try {
      // CRITICAL: Set pixel ratio to 1 for standalone rendering
      // This ensures readPixels gets the full image, not just a quarter on Retina displays
      engine.getRenderer().setPixelRatio(1)
      
      // Apply all state to the engine
      applyFullStateToEngine(engine, state)
      
      // Set render target size - this also sets aspect ratio
      engine.handleResize(width, height)
      
      // Render the gradient
      engine.render()
      
      // Get pixel data from the WebGL canvas
      const gl = engine.getRenderer().getContext() as WebGL2RenderingContext
      const pixels = new Uint8Array(width * height * 4)
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      
      return pixels
    } finally {
      // Clean up - force context loss for exports to release GPU memory
      engine.dispose(true)
    }
  }
}

/**
 * Export sizes available
 */
export const EXPORT_SIZES = {
  preview: { width: 600, height: 400, label: 'Preview', description: 'Quick download' },
  hd: { width: 1920, height: 1080, label: 'HD', description: '1920×1080' },
  '2k': { width: 2560, height: 1440, label: '2K', description: '2560×1440' },
  '4k': { width: 3840, height: 2160, label: '4K', description: '3840×2160' },
} as const

export type ExportSize = keyof typeof EXPORT_SIZES

/**
 * ShaderManager
 * 
 * Manages GLSL shaders for gradient rendering.
 * Types: Linear, Radial, Conic, Diamond, Spiral, Aurora, Stripes, Folded, Reverb
 */

import * as THREE from 'three'
import type {
  ColorStop,
  LinearSettings, RadialSettings, ConicSettings, DiamondSettings,
  SpiralSettings, AuroraSettings, StripesSettings, FoldedSettings, ReverbSettings,
  BlendOptions, MaterialState, WarpState, GeometryEffectsState, EffectsState
} from '@/types/gradient'

// Import modular shaders
import {
  baseVertexShader,
  linearGradientShader,
  radialGradientShader,
  conicGradientShader,
  diamondGradientShader,
  spiralGradientShader,
  auroraGradientShader,
  stripesGradientShader,
  foldedGradientShader,
  reverbGradientShader,
} from '@/lib/shaders'

// === TYPES ===

export interface GradientUniforms {
  colorStops: THREE.Uniform<THREE.Vector3[]>
  colorPositions: THREE.Uniform<number[]>
  numStops: THREE.Uniform<number>
  angle: THREE.Uniform<number>
  centerX: THREE.Uniform<number>
  centerY: THREE.Uniform<number>
  aspectRatio: THREE.Uniform<number>
  time: THREE.Uniform<number>
  
  // Gradient animation uniforms
  u_gradientOffset: THREE.Uniform<number>
  u_gradientScale: THREE.Uniform<number>
  u_colorSpread: THREE.Uniform<number>
  u_colorCycle: THREE.Uniform<number>
  u_gradientCenterX: THREE.Uniform<number>
  u_gradientCenterY: THREE.Uniform<number>
  u_innerRadius: THREE.Uniform<number>
  u_outerRadius: THREE.Uniform<number>
  u_conicOffset: THREE.Uniform<number>
  blendHardStops: THREE.Uniform<number>
  blendSteps: THREE.Uniform<number>
  blendEasing: THREE.Uniform<number>
  blendColorMode: THREE.Uniform<number>
  linearRepeatMode: THREE.Uniform<number>
  u_linearOffsetX: THREE.Uniform<number>
  u_linearOffsetY: THREE.Uniform<number>
  u_linearScale: THREE.Uniform<number>
  radialPosX: THREE.Uniform<number>
  radialPosY: THREE.Uniform<number>
  radialScaleX: THREE.Uniform<number>
  radialScaleY: THREE.Uniform<number>
  radialZoom: THREE.Uniform<number>            // Overall size multiplier
  radialRepeatMode: THREE.Uniform<number>
  // Radial shape variants
  radialShape: THREE.Uniform<number>           // 0=circle, 1=roundedRect, 2=squircle, 3=pill
  radialCornerRadius: THREE.Uniform<number>    // 0-1 normalized
  radialShapeAspect: THREE.Uniform<number>     // width/height ratio
  conicPosX: THREE.Uniform<number>
  conicPosY: THREE.Uniform<number>
  conicStartAngle: THREE.Uniform<number>
  conicRepeatCount: THREE.Uniform<number>
  diamondPosX: THREE.Uniform<number>
  diamondPosY: THREE.Uniform<number>
  diamondScaleX: THREE.Uniform<number>
  diamondScaleY: THREE.Uniform<number>
  diamondRotation: THREE.Uniform<number>
  diamondRepeatMode: THREE.Uniform<number>
  diamondBlendStyle: THREE.Uniform<number>
  spiralTightness: THREE.Uniform<number>
  spiralDirection: THREE.Uniform<number>
  spiralDecay: THREE.Uniform<number>
  spiralPosX: THREE.Uniform<number>
  spiralPosY: THREE.Uniform<number>
  spiralColorSpread: THREE.Uniform<number>
  spiralArmWidth: THREE.Uniform<number>
  auroraWaveCount: THREE.Uniform<number>
  auroraFlow: THREE.Uniform<number>
  auroraSoftness: THREE.Uniform<number>
  auroraVerticalPos: THREE.Uniform<number>
  auroraRotation: THREE.Uniform<number>
  auroraSpread: THREE.Uniform<number>
  auroraIntensity: THREE.Uniform<number>
  auroraBlend: THREE.Uniform<number>
  stripesCount: THREE.Uniform<number>
  stripesAngle: THREE.Uniform<number>
  stripesSharpness: THREE.Uniform<number>
  stripesFade: THREE.Uniform<number>
  stripesOffset: THREE.Uniform<number>
  foldedCount: THREE.Uniform<number>
  foldedAngle: THREE.Uniform<number>
  foldedLightDir: THREE.Uniform<number>
  foldedSoftness: THREE.Uniform<number>
  foldedDepth: THREE.Uniform<number>
  reverbShape: THREE.Uniform<number>
  reverbRings: THREE.Uniform<number>
  reverbSpacing: THREE.Uniform<number>
  reverbThickness: THREE.Uniform<number>
  reverbZoom: THREE.Uniform<number>
  reverbDecay: THREE.Uniform<number>
  reverbBlend: THREE.Uniform<number>
  reverbPosX: THREE.Uniform<number>
  reverbPosY: THREE.Uniform<number>
  // Material uniforms
  matIridescentEnabled: THREE.Uniform<number>
  matIridescentIntensity: THREE.Uniform<number>
  matIridescentScale: THREE.Uniform<number>
  matIridescentShift: THREE.Uniform<number>
  matMetallicEnabled: THREE.Uniform<number>
  matMetallicIntensity: THREE.Uniform<number>
  matMetallicHighlight: THREE.Uniform<number>
  matMetallicContrast: THREE.Uniform<number>
  matHolographicEnabled: THREE.Uniform<number>
  matHolographicIntensity: THREE.Uniform<number>
  matHolographicDensity: THREE.Uniform<number>
  matHolographicAngle: THREE.Uniform<number>
  matVelvetEnabled: THREE.Uniform<number>
  matVelvetIntensity: THREE.Uniform<number>
  matVelvetDepth: THREE.Uniform<number>
  matVelvetGlow: THREE.Uniform<number>
  
  // Warp uniforms (UV distortion)
  // Bend - "The Curve" - curves like wrapping around a cylinder
  u_bendAmount: THREE.Uniform<number>
  u_bendAxis: THREE.Uniform<number>
  u_bendPinch: THREE.Uniform<number>
  
  // Twist - "The Spiral" - rotates around a center point
  u_twistAmount: THREE.Uniform<number>
  u_twistRadius: THREE.Uniform<number>
  u_twistCenter: THREE.Uniform<THREE.Vector2>
  
  // Sphere - "The Lens" - fisheye/barrel distortion
  u_sphereAmount: THREE.Uniform<number>
  u_sphereRadius: THREE.Uniform<number>
  u_sphereCenter: THREE.Uniform<THREE.Vector2>
  
  // Wave - "The Undulation" - sinusoidal flow
  u_waveAmplitude: THREE.Uniform<number>
  u_waveFrequency: THREE.Uniform<number>
  u_waveDirection: THREE.Uniform<number>
  u_waveRotation: THREE.Uniform<number>
  
  // Bulge - "The Push/Pull" - expands/contracts from a point
  u_bulgeAmount: THREE.Uniform<number>
  u_bulgeRadius: THREE.Uniform<number>
  u_bulgeCenter: THREE.Uniform<THREE.Vector2>
  
  // Ripple - "The Stone in Water" - concentric waves
  u_rippleAmplitude: THREE.Uniform<number>
  u_rippleFrequency: THREE.Uniform<number>
  u_rippleCenter: THREE.Uniform<THREE.Vector2>
  u_rippleDecay: THREE.Uniform<number>
  u_rippleRotation: THREE.Uniform<number>
  
  // Blur - "The Softener" - post-processing
  u_blurAmount: THREE.Uniform<number>
  
  // Geometry Effects uniforms
  // Grid Refraction
  u_gridEnabled: THREE.Uniform<boolean>
  u_gridTilesX: THREE.Uniform<number>
  u_gridTilesY: THREE.Uniform<number>
  u_gridRefraction: THREE.Uniform<number>
  u_gridAngle: THREE.Uniform<number>
  u_gridVariation: THREE.Uniform<number>
  // Grid Mesh Deformation
  u_gridMeshBulge: THREE.Uniform<number>
  u_gridMeshSkewX: THREE.Uniform<number>
  u_gridMeshSkewY: THREE.Uniform<number>
  u_gridMeshPerspective: THREE.Uniform<number>
  u_gridMeshPerspectiveAngle: THREE.Uniform<number>
  u_gridMeshCurve: THREE.Uniform<number>
  u_gridMeshCurveAxis: THREE.Uniform<number>
  u_gridMeshWave: THREE.Uniform<number>
  u_gridMeshWaveFreq: THREE.Uniform<number>
  u_gridMeshWaveAngle: THREE.Uniform<number>
  u_gridMeshTwist: THREE.Uniform<number>
  
  // Column Refraction
  u_columnsEnabled: THREE.Uniform<boolean>
  u_columnsCount: THREE.Uniform<number>
  u_columnsOffset: THREE.Uniform<number>
  u_columnsAngle: THREE.Uniform<number>
  u_columnsPerspective: THREE.Uniform<number>
  u_columnsPattern: THREE.Uniform<number>
  // Column Mesh Deformation
  u_columnsMeshBulge: THREE.Uniform<number>
  u_columnsMeshSkewX: THREE.Uniform<number>
  u_columnsMeshSkewY: THREE.Uniform<number>
  u_columnsMeshCurve: THREE.Uniform<number>
  u_columnsMeshCurveAxis: THREE.Uniform<number>
  u_columnsMeshWave: THREE.Uniform<number>
  u_columnsMeshWaveFreq: THREE.Uniform<number>
  u_columnsMeshWaveAngle: THREE.Uniform<number>
  u_columnsMeshTwist: THREE.Uniform<number>
  
  // 3D Depth
  u_depthEnabled: THREE.Uniform<boolean>
  u_depthAmount: THREE.Uniform<number>
  u_depthCenter: THREE.Uniform<THREE.Vector2>
  u_depthFalloff: THREE.Uniform<number>
  u_depthShading: THREE.Uniform<boolean>
  // Depth Dimensionality
  u_depthSurfaceType: THREE.Uniform<number>
  u_depthSurfaceWave: THREE.Uniform<number>
  u_depthWaveScale: THREE.Uniform<number>
  
  // Effects uniforms
  // Color Adjustments
  u_colorEnabled: THREE.Uniform<boolean>
  u_brightness: THREE.Uniform<number>
  u_contrast: THREE.Uniform<number>
  u_saturation: THREE.Uniform<number>
  u_hueShift: THREE.Uniform<number>
  
  // Glow
  u_glowEnabled: THREE.Uniform<boolean>
  u_glowAmount: THREE.Uniform<number>
  u_glowThreshold: THREE.Uniform<number>
  u_glowRadius: THREE.Uniform<number>
  
  // Chromatic Aberration
  u_chromaticEnabled: THREE.Uniform<boolean>
  u_chromaticAmount: THREE.Uniform<number>
  u_chromaticAngle: THREE.Uniform<number>
  
  // Vignette
  u_vignetteEnabled: THREE.Uniform<boolean>
  u_vignetteAmount: THREE.Uniform<number>
  u_vignetteSoftness: THREE.Uniform<number>
  u_vignetteRoundness: THREE.Uniform<number>
  u_vignetteInvert: THREE.Uniform<boolean>
  
  // Posterize
  u_posterizeEnabled: THREE.Uniform<boolean>
  u_posterizeLevels: THREE.Uniform<number>
  
  // Grain
  u_grainEnabled: THREE.Uniform<boolean>
  u_grainAmount: THREE.Uniform<number>
  u_grainSize: THREE.Uniform<number>
  u_grainMono: THREE.Uniform<boolean>
  
  // Dither
  u_ditherEnabled: THREE.Uniform<boolean>
  u_ditherAmount: THREE.Uniform<number>
  
  // Halftone
  u_halftoneEnabled: THREE.Uniform<boolean>
  u_halftoneIntensity: THREE.Uniform<number>
  u_halftoneScale: THREE.Uniform<number>
  u_halftoneSoftness: THREE.Uniform<number>
  
  // Scanlines
  u_scanlinesEnabled: THREE.Uniform<boolean>
  u_scanlinesIntensity: THREE.Uniform<number>
  u_scanlinesDensity: THREE.Uniform<number>
  
  // Pixelate
  u_pixelateEnabled: THREE.Uniform<boolean>
  u_pixelateSize: THREE.Uniform<number>
  
  // ASCII - Core
  u_asciiEnabled: THREE.Uniform<boolean>
  u_asciiAtlas: THREE.Uniform<THREE.Texture | null>
  u_asciiDensity: THREE.Uniform<number>
  u_asciiCharCount: THREE.Uniform<number>
  u_asciiColored: THREE.Uniform<boolean>
  u_asciiMonoColor: THREE.Uniform<THREE.Vector3>
  u_asciiBackground: THREE.Uniform<THREE.Vector3>
  u_asciiInvert: THREE.Uniform<boolean>
  u_asciiLockGrid: THREE.Uniform<boolean>
  // ASCII - Enhanced
  u_asciiRotation: THREE.Uniform<number>
  u_asciiLineHeight: THREE.Uniform<number>
  u_asciiLetterSpacing: THREE.Uniform<number>
  // ASCII - Shadow
  u_asciiShadowEnabled: THREE.Uniform<boolean>
  u_asciiShadowColor: THREE.Uniform<THREE.Vector3>
  u_asciiShadowOffsetX: THREE.Uniform<number>
  u_asciiShadowOffsetY: THREE.Uniform<number>
  u_asciiShadowBlur: THREE.Uniform<number>
  // ASCII - Glow
  u_asciiGlowEnabled: THREE.Uniform<boolean>
  u_asciiGlowAmount: THREE.Uniform<number>
  u_asciiGlowRadius: THREE.Uniform<number>
  // ASCII - Edge Detection
  u_asciiEdgeMode: THREE.Uniform<boolean>
  u_asciiEdgeThreshold: THREE.Uniform<number>
  // ASCII - Perspective
  u_asciiPerspective: THREE.Uniform<boolean>
  u_asciiPerspectiveX: THREE.Uniform<number>
  u_asciiPerspectiveY: THREE.Uniform<number>

  // Dot Matrix
  u_dotMatrixEnabled: THREE.Uniform<boolean>
  u_dotMatrixShape: THREE.Uniform<number>
  u_dotMatrixDensity: THREE.Uniform<number>
  u_dotMatrixSizeMin: THREE.Uniform<number>
  u_dotMatrixSizeMax: THREE.Uniform<number>
  u_dotMatrixColorMode: THREE.Uniform<number>
  u_dotMatrixMonoColor: THREE.Uniform<THREE.Vector3>
  u_dotMatrixDuoDark: THREE.Uniform<THREE.Vector3>
  u_dotMatrixDuoLight: THREE.Uniform<THREE.Vector3>
  u_dotMatrixBackground: THREE.Uniform<THREE.Vector3>
  u_dotMatrixSoftness: THREE.Uniform<number>
  u_dotMatrixInvert: THREE.Uniform<boolean>
  u_dotMatrixLockGrid: THREE.Uniform<boolean>
  u_dotMatrixGap: THREE.Uniform<number>
  u_dotMatrixTexture: THREE.Uniform<number>
  
  // Time for animations
  u_time: THREE.Uniform<number>
  
  // Lava Lamp - Organic Warp uniforms
  u_lavaLampEnabled: THREE.Uniform<boolean>
  u_lavaLampIntensity: THREE.Uniform<number>
  u_lavaLampBlobCount: THREE.Uniform<number>
  u_lavaLampPositions: THREE.Uniform<THREE.Vector2[]>
  u_lavaLampSizes: THREE.Uniform<number[]>
  u_lavaLampTime: THREE.Uniform<number>
  
  [key: string]: THREE.IUniform<unknown>
}

export type GradientType = 'linear' | 'radial' | 'conic' | 'diamond' | 'spiral' | 'aurora' | 'stripes' | 'folded' | 'reverb'

// === UTILITY FUNCTIONS ===

export function hexToVec3(hex: string): THREE.Vector3 {
  const cleanHex = hex.replace('#', '')
  return new THREE.Vector3(
    parseInt(cleanHex.substring(0, 2), 16) / 255,
    parseInt(cleanHex.substring(2, 4), 16) / 255,
    parseInt(cleanHex.substring(4, 6), 16) / 255
  )
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// === SHADER MAP ===

const SHADER_MAP: Record<GradientType, string> = {
  linear: linearGradientShader,
  radial: radialGradientShader,
  conic: conicGradientShader,
  diamond: diamondGradientShader,
  spiral: spiralGradientShader,
  aurora: auroraGradientShader,
  stripes: stripesGradientShader,
  folded: foldedGradientShader,
  reverb: reverbGradientShader,
}

// === SHADER MANAGER CLASS ===

// Create a 1x1 white placeholder texture for uninitialized samplers
function createPlaceholderTexture(): THREE.DataTexture {
  const data = new Uint8Array([255, 255, 255, 255]) // White pixel
  const texture = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat)
  texture.needsUpdate = true
  return texture
}

export class ShaderManager {
  private material: THREE.ShaderMaterial | null = null
  private uniforms: GradientUniforms
  private currentType: GradientType = 'linear'
  private placeholderTexture: THREE.DataTexture
  
  constructor() {
    this.placeholderTexture = createPlaceholderTexture()
    this.uniforms = this.createDefaultUniforms()
  }
  
  private createDefaultUniforms(): GradientUniforms {
    const defaultColors = Array(10).fill(null).map((_, i) => {
      if (i === 0) return new THREE.Vector3(0.39, 0.4, 0.95)
      if (i === 1) return new THREE.Vector3(0.55, 0.36, 0.96)
      if (i === 2) return new THREE.Vector3(0.85, 0.27, 0.94)
      return new THREE.Vector3(0, 0, 0)
    })
    
    return {
      colorStops: new THREE.Uniform(defaultColors),
      colorPositions: new THREE.Uniform([0, 0.5, 1, 0, 0, 0, 0, 0, 0, 0]),
      numStops: new THREE.Uniform(3),
      angle: new THREE.Uniform(0.785398), // 45 degrees
      centerX: new THREE.Uniform(0.5),
      centerY: new THREE.Uniform(0.5),
      aspectRatio: new THREE.Uniform(1.0),
      time: new THREE.Uniform(0),
      
      // Gradient animation uniforms
      u_gradientOffset: new THREE.Uniform(0),
      u_gradientScale: new THREE.Uniform(1),
      u_colorSpread: new THREE.Uniform(1),
      u_colorCycle: new THREE.Uniform(0),
      u_gradientCenterX: new THREE.Uniform(50),
      u_gradientCenterY: new THREE.Uniform(50),
      u_innerRadius: new THREE.Uniform(0),
      u_outerRadius: new THREE.Uniform(100),
      u_conicOffset: new THREE.Uniform(0),
      
      // Blend options
      blendHardStops: new THREE.Uniform(0),
      blendSteps: new THREE.Uniform(0),
      blendEasing: new THREE.Uniform(0),
      blendColorMode: new THREE.Uniform(0), // 0=linear RGB, 1=HSV short, 2=HSV long
      
      // Linear
      linearRepeatMode: new THREE.Uniform(0),
      u_linearOffsetX: new THREE.Uniform(0),
      u_linearOffsetY: new THREE.Uniform(0),
      u_linearScale: new THREE.Uniform(1),
      
      // Radial
      radialPosX: new THREE.Uniform(0.5),
      radialPosY: new THREE.Uniform(0.5),
      radialScaleX: new THREE.Uniform(1),
      radialScaleY: new THREE.Uniform(1),
      radialZoom: new THREE.Uniform(1.0),          // Overall size multiplier
      radialRepeatMode: new THREE.Uniform(0),
      // Radial shape variants
      radialShape: new THREE.Uniform(0),           // 0=circle, 1=roundedRect, 2=squircle, 3=pill
      radialCornerRadius: new THREE.Uniform(0.3),  // 0-1 normalized
      radialShapeAspect: new THREE.Uniform(1.0),   // width/height ratio
      
      // Conic
      conicPosX: new THREE.Uniform(0.5),
      conicPosY: new THREE.Uniform(0.5),
      conicStartAngle: new THREE.Uniform(0),
      conicRepeatCount: new THREE.Uniform(1),
      
      // Diamond
      diamondPosX: new THREE.Uniform(0.5),
      diamondPosY: new THREE.Uniform(0.5),
      diamondScaleX: new THREE.Uniform(1),
      diamondScaleY: new THREE.Uniform(1),
      diamondRotation: new THREE.Uniform(0),
      diamondRepeatMode: new THREE.Uniform(0),
      diamondBlendStyle: new THREE.Uniform(0),
      
      // Spiral
      spiralTightness: new THREE.Uniform(5.0),
      spiralDirection: new THREE.Uniform(1.0),
      spiralDecay: new THREE.Uniform(0),
      spiralPosX: new THREE.Uniform(0.5),
      spiralPosY: new THREE.Uniform(0.5),
      spiralColorSpread: new THREE.Uniform(1.0),
      spiralArmWidth: new THREE.Uniform(0.5),
      
      // Aurora
      auroraWaveCount: new THREE.Uniform(4.0),
      auroraFlow: new THREE.Uniform(50.0),
      auroraSoftness: new THREE.Uniform(60.0),
      auroraVerticalPos: new THREE.Uniform(0.5),
      auroraRotation: new THREE.Uniform(0.0),
      auroraSpread: new THREE.Uniform(50.0),
      auroraIntensity: new THREE.Uniform(100.0),
      auroraBlend: new THREE.Uniform(50.0),
      
      // Stripes
      stripesCount: new THREE.Uniform(6.0),
      stripesAngle: new THREE.Uniform(0.785398), // 45 degrees
      stripesSharpness: new THREE.Uniform(0.5),
      stripesFade: new THREE.Uniform(0),
      stripesOffset: new THREE.Uniform(0),
      
      // Folded
      foldedCount: new THREE.Uniform(6.0),
      foldedAngle: new THREE.Uniform(0),
      foldedLightDir: new THREE.Uniform(0.785398), // 45 degrees
      foldedSoftness: new THREE.Uniform(0.5),
      foldedDepth: new THREE.Uniform(0.5),
      
      // Reverb
      reverbShape: new THREE.Uniform(0), // circle
      reverbRings: new THREE.Uniform(8),
      reverbSpacing: new THREE.Uniform(0), // equal
      reverbThickness: new THREE.Uniform(0.5),
      reverbZoom: new THREE.Uniform(1),
      reverbDecay: new THREE.Uniform(0),
      reverbBlend: new THREE.Uniform(0.2),
      reverbPosX: new THREE.Uniform(0.5),
      reverbPosY: new THREE.Uniform(0.5),
      
      // Materials
      matIridescentEnabled: new THREE.Uniform(0),
      matIridescentIntensity: new THREE.Uniform(50.0),
      matIridescentScale: new THREE.Uniform(10.0),
      matIridescentShift: new THREE.Uniform(0.0),
      matMetallicEnabled: new THREE.Uniform(0),
      matMetallicIntensity: new THREE.Uniform(50.0),
      matMetallicHighlight: new THREE.Uniform(50.0),
      matMetallicContrast: new THREE.Uniform(50.0),
      matHolographicEnabled: new THREE.Uniform(0),
      matHolographicIntensity: new THREE.Uniform(50.0),
      matHolographicDensity: new THREE.Uniform(8.0),
      matHolographicAngle: new THREE.Uniform(45.0),
      matVelvetEnabled: new THREE.Uniform(0),
      matVelvetIntensity: new THREE.Uniform(50.0),
      matVelvetDepth: new THREE.Uniform(50.0),
      matVelvetGlow: new THREE.Uniform(50.0),

      // Warp uniforms (UV distortion)
      // Bend - "The Curve"
      u_bendAmount: new THREE.Uniform(0),
      u_bendAxis: new THREE.Uniform(0),
      u_bendPinch: new THREE.Uniform(0),
      
      // Twist - "The Spiral"
      u_twistAmount: new THREE.Uniform(0),
      u_twistRadius: new THREE.Uniform(1.0),
      u_twistCenter: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
      
      // Sphere - "The Lens"
      u_sphereAmount: new THREE.Uniform(0),
      u_sphereRadius: new THREE.Uniform(0.7),
      u_sphereCenter: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
      
      // Wave - "The Undulation"
      u_waveAmplitude: new THREE.Uniform(0),
      u_waveFrequency: new THREE.Uniform(3),
      u_waveDirection: new THREE.Uniform(0),
      u_waveRotation: new THREE.Uniform(0),
      
      // Bulge - "The Push/Pull"
      u_bulgeAmount: new THREE.Uniform(0),
      u_bulgeRadius: new THREE.Uniform(0.5),
      u_bulgeCenter: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
      
      // Ripple - "The Stone in Water"
      u_rippleAmplitude: new THREE.Uniform(0),
      u_rippleFrequency: new THREE.Uniform(5),
      u_rippleCenter: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
      u_rippleDecay: new THREE.Uniform(50),
      u_rippleRotation: new THREE.Uniform(0),
      
      // Blur - "The Softener"
      u_blurAmount: new THREE.Uniform(0),
      
      // Geometry Effects
      // Grid Refraction
      u_gridEnabled: new THREE.Uniform(false),
      u_gridTilesX: new THREE.Uniform(4),
      u_gridTilesY: new THREE.Uniform(4),
      u_gridRefraction: new THREE.Uniform(30),
      u_gridAngle: new THREE.Uniform(0),
      u_gridVariation: new THREE.Uniform(50),
      // Grid Mesh Deformation
      u_gridMeshBulge: new THREE.Uniform(0),
      u_gridMeshSkewX: new THREE.Uniform(0),
      u_gridMeshSkewY: new THREE.Uniform(0),
      u_gridMeshPerspective: new THREE.Uniform(0),
      u_gridMeshPerspectiveAngle: new THREE.Uniform(0),
      u_gridMeshCurve: new THREE.Uniform(0),
      u_gridMeshCurveAxis: new THREE.Uniform(0),
      u_gridMeshWave: new THREE.Uniform(0),
      u_gridMeshWaveFreq: new THREE.Uniform(3),
      u_gridMeshWaveAngle: new THREE.Uniform(0),
      u_gridMeshTwist: new THREE.Uniform(0),
      
      // Column Refraction
      u_columnsEnabled: new THREE.Uniform(false),
      u_columnsCount: new THREE.Uniform(8),
      u_columnsOffset: new THREE.Uniform(30),
      u_columnsAngle: new THREE.Uniform(0),
      u_columnsPerspective: new THREE.Uniform(0),
      u_columnsPattern: new THREE.Uniform(2), // wave
      // Column Mesh Deformation
      u_columnsMeshBulge: new THREE.Uniform(0),
      u_columnsMeshSkewX: new THREE.Uniform(0),
      u_columnsMeshSkewY: new THREE.Uniform(0),
      u_columnsMeshCurve: new THREE.Uniform(0),
      u_columnsMeshCurveAxis: new THREE.Uniform(0),
      u_columnsMeshWave: new THREE.Uniform(0),
      u_columnsMeshWaveFreq: new THREE.Uniform(3),
      u_columnsMeshWaveAngle: new THREE.Uniform(0),
      u_columnsMeshTwist: new THREE.Uniform(0),
      
      // 3D Depth
      u_depthEnabled: new THREE.Uniform(false),
      u_depthAmount: new THREE.Uniform(0),
      u_depthCenter: new THREE.Uniform(new THREE.Vector2(0.5, 0.5)),
      u_depthFalloff: new THREE.Uniform(50),
      u_depthShading: new THREE.Uniform(false),
      // Depth Dimensionality
      u_depthSurfaceType: new THREE.Uniform(0), // sphere
      u_depthSurfaceWave: new THREE.Uniform(0),
      u_depthWaveScale: new THREE.Uniform(3),
      
      // Effects
      // Color Adjustments
      u_colorEnabled: new THREE.Uniform(false),
      u_brightness: new THREE.Uniform(0),
      u_contrast: new THREE.Uniform(0),
      u_saturation: new THREE.Uniform(0),
      u_hueShift: new THREE.Uniform(0),
      
      // Glow
      u_glowEnabled: new THREE.Uniform(false),
      u_glowAmount: new THREE.Uniform(30),
      u_glowThreshold: new THREE.Uniform(50),
      u_glowRadius: new THREE.Uniform(30),
      
      // Chromatic Aberration
      u_chromaticEnabled: new THREE.Uniform(false),
      u_chromaticAmount: new THREE.Uniform(20),
      u_chromaticAngle: new THREE.Uniform(0),
      
      // Vignette
      u_vignetteEnabled: new THREE.Uniform(false),
      u_vignetteAmount: new THREE.Uniform(30),
      u_vignetteSoftness: new THREE.Uniform(50),
      u_vignetteRoundness: new THREE.Uniform(50),
      u_vignetteInvert: new THREE.Uniform(false),
      
      // Posterize
      u_posterizeEnabled: new THREE.Uniform(false),
      u_posterizeLevels: new THREE.Uniform(8),
      
      // Grain
      u_grainEnabled: new THREE.Uniform(false),
      u_grainAmount: new THREE.Uniform(20),
      u_grainSize: new THREE.Uniform(1),
      u_grainMono: new THREE.Uniform(true),
      
      // Dither
      u_ditherEnabled: new THREE.Uniform(false),
      u_ditherAmount: new THREE.Uniform(30),
      
      // Halftone
      u_halftoneEnabled: new THREE.Uniform(false),
      u_halftoneIntensity: new THREE.Uniform(60),
      u_halftoneScale: new THREE.Uniform(80),
      u_halftoneSoftness: new THREE.Uniform(40),
      
      // Scanlines
      u_scanlinesEnabled: new THREE.Uniform(false),
      u_scanlinesIntensity: new THREE.Uniform(30),
      u_scanlinesDensity: new THREE.Uniform(10),
      
      // Pixelate
      u_pixelateEnabled: new THREE.Uniform(false),
      u_pixelateSize: new THREE.Uniform(20),
      
      // ASCII - Core
      u_asciiEnabled: new THREE.Uniform(false),
      u_asciiAtlas: new THREE.Uniform(this.placeholderTexture),
      u_asciiDensity: new THREE.Uniform(80),
      u_asciiCharCount: new THREE.Uniform(11), // "GradientLab".length
      u_asciiColored: new THREE.Uniform(true),
      u_asciiMonoColor: new THREE.Uniform(new THREE.Vector3(1, 1, 1)), // #ffffff
      u_asciiBackground: new THREE.Uniform(new THREE.Vector3(0.039, 0.039, 0.039)), // #0a0a0a
      u_asciiInvert: new THREE.Uniform(false),
      u_asciiLockGrid: new THREE.Uniform(false), // false = animated grid (default), true = static mask
      // ASCII - Enhanced
      u_asciiRotation: new THREE.Uniform(0),
      u_asciiLineHeight: new THREE.Uniform(1.0), // 100% = 1.0
      u_asciiLetterSpacing: new THREE.Uniform(1.0), // 100% = 1.0
      // ASCII - Shadow
      u_asciiShadowEnabled: new THREE.Uniform(false),
      u_asciiShadowColor: new THREE.Uniform(new THREE.Vector3(0, 0, 0)), // #000000
      u_asciiShadowOffsetX: new THREE.Uniform(2),
      u_asciiShadowOffsetY: new THREE.Uniform(2),
      u_asciiShadowBlur: new THREE.Uniform(0),
      // ASCII - Glow
      u_asciiGlowEnabled: new THREE.Uniform(false),
      u_asciiGlowAmount: new THREE.Uniform(50),
      u_asciiGlowRadius: new THREE.Uniform(0.3), // 30% = 0.3
      // ASCII - Edge Detection
      u_asciiEdgeMode: new THREE.Uniform(false),
      u_asciiEdgeThreshold: new THREE.Uniform(0.5), // 50% = 0.5
      // ASCII - Perspective
      u_asciiPerspective: new THREE.Uniform(false),
      u_asciiPerspectiveX: new THREE.Uniform(0),
      u_asciiPerspectiveY: new THREE.Uniform(0),

      // Dot Matrix
      u_dotMatrixEnabled: new THREE.Uniform(false),
      u_dotMatrixShape: new THREE.Uniform(0), // circle
      u_dotMatrixDensity: new THREE.Uniform(60),
      u_dotMatrixSizeMin: new THREE.Uniform(0.1), // 10%
      u_dotMatrixSizeMax: new THREE.Uniform(1.0), // 100%
      u_dotMatrixColorMode: new THREE.Uniform(0), // colored
      u_dotMatrixMonoColor: new THREE.Uniform(new THREE.Vector3(1, 1, 1)), // #ffffff
      u_dotMatrixDuoDark: new THREE.Uniform(new THREE.Vector3(0.039, 0.039, 0.039)), // #0a0a0a
      u_dotMatrixDuoLight: new THREE.Uniform(new THREE.Vector3(1, 1, 1)), // #ffffff
      u_dotMatrixBackground: new THREE.Uniform(new THREE.Vector3(0.039, 0.039, 0.039)), // #0a0a0a
      u_dotMatrixSoftness: new THREE.Uniform(0),
      u_dotMatrixInvert: new THREE.Uniform(false),
      u_dotMatrixLockGrid: new THREE.Uniform(false), // false = animated grid (default), true = static mask
      u_dotMatrixGap: new THREE.Uniform(0), // 0 = no gap (dots can touch), 1 = max gap
      u_dotMatrixTexture: new THREE.Uniform(0), // 0 = clean edges, 1 = max organic texture
      
      // Time
      u_time: new THREE.Uniform(0),
      
      // Lava Lamp - Organic Warp
      u_lavaLampEnabled: new THREE.Uniform(false),
      u_lavaLampIntensity: new THREE.Uniform(0.5),  // Distortion strength (0-1)
      u_lavaLampBlobCount: new THREE.Uniform(4),
      u_lavaLampPositions: new THREE.Uniform([
        new THREE.Vector2(0.3, 0.3),
        new THREE.Vector2(0.7, 0.3),
        new THREE.Vector2(0.5, 0.7),
        new THREE.Vector2(0.4, 0.5),
        new THREE.Vector2(0.6, 0.6),
        new THREE.Vector2(0.2, 0.6),
      ]),
      u_lavaLampSizes: new THREE.Uniform([0.25, 0.28, 0.22, 0.3, 0.26, 0.24]),  // Influence radius
      u_lavaLampTime: new THREE.Uniform(0.0),  // Animation time
    }
  }
  
  private getFragmentShader(type: GradientType): string {
    return SHADER_MAP[type] || SHADER_MAP.linear
  }
  
  createMaterial(type: GradientType): THREE.ShaderMaterial {
    this.currentType = type
    this.material = new THREE.ShaderMaterial({
      vertexShader: baseVertexShader,
      fragmentShader: this.getFragmentShader(type),
      uniforms: this.uniforms,
    })
    return this.material
  }
  
  setGradientType(type: GradientType): THREE.ShaderMaterial | null {
    if (type !== this.currentType && this.material) {
      this.currentType = type
      this.material.fragmentShader = this.getFragmentShader(type)
      this.material.needsUpdate = true
    }
    return this.material
  }
  
  // === UNIFORM SETTERS ===
  
  setColorStops(stops: ColorStop[]): void {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    sortedStops.forEach((stop, i) => {
      if (i < 10) {
        this.uniforms.colorStops.value[i] = hexToVec3(stop.color)
        this.uniforms.colorPositions.value[i] = stop.position / 100
      }
    })
    this.uniforms.numStops.value = Math.min(sortedStops.length, 10)
  }
  
  setAngle(degrees: number): void {
    this.uniforms.angle.value = degreesToRadians(degrees - 90)
  }
  
  setCenter(x: number, y: number): void {
    this.uniforms.centerX.value = x / 100
    this.uniforms.centerY.value = 1 - (y / 100)
  }
  
  setBlendOptions(options: BlendOptions): void {
    this.uniforms.blendHardStops.value = options.hardStops ? 1 : 0
    this.uniforms.blendSteps.value = options.steps ?? 0
    const easingMap: Record<BlendOptions['easing'], number> = {
      linear: 0, easeIn: 1, easeOut: 2, easeInOut: 3, bounce: 4,
    }
    this.uniforms.blendEasing.value = easingMap[options.easing] ?? 0
    // Color interpolation mode: 0=linear RGB (default), 1=HSV short path, 2=HSV long path
    const colorModeMap: Record<string, number> = {
      'linear': 0,  // Linear RGB interpolation (new default)
      'short': 1,   // HSV short path (classic behavior)
      'long': 2,    // HSV long path (around the color wheel)
    }
    this.uniforms.blendColorMode.value = colorModeMap[options.huePath] ?? 0
  }

  setAspectRatio(width: number, height: number): void {
    this.uniforms.aspectRatio.value = width / height
  }
  
  setTime(time: number): void {
    this.uniforms.time.value = time
  }

  // Gradient animation setters
  setGradientOffset(offset: number): void {
    this.uniforms.u_gradientOffset.value = offset
  }

  setGradientScale(scale: number): void {
    this.uniforms.u_gradientScale.value = scale
  }

  setColorSpread(spread: number): void {
    this.uniforms.u_colorSpread.value = spread
  }

  setColorCycle(cycle: number): void {
    this.uniforms.u_colorCycle.value = cycle
  }

  setGradientCenter(x: number, y: number): void {
    this.uniforms.u_gradientCenterX.value = x
    this.uniforms.u_gradientCenterY.value = y
  }

  setInnerRadius(radius: number): void {
    this.uniforms.u_innerRadius.value = radius
  }

  setOuterRadius(radius: number): void {
    this.uniforms.u_outerRadius.value = radius
  }

  setConicOffset(offset: number): void {
    this.uniforms.u_conicOffset.value = offset
  }
  
  // Type-specific settings
  
  setLinearSettings(settings: LinearSettings): void {
    this.uniforms.linearRepeatMode.value = settings.repeatMode === 'mirror' ? 1 : 0
    // Wire offset and scale uniforms (converts from UI range to shader range)
    this.uniforms.u_linearOffsetX.value = (settings.offsetX ?? 0) / 100
    this.uniforms.u_linearOffsetY.value = (settings.offsetY ?? 0) / 100
    this.uniforms.u_linearScale.value = Math.max(0.1, (settings.scale ?? 100) / 100)
  }
  
  setRadialSettings(settings: RadialSettings): void {
    this.uniforms.radialPosX.value = settings.positionX / 100
    this.uniforms.radialPosY.value = 1 - (settings.positionY / 100)
    this.uniforms.radialScaleX.value = settings.scaleX
    this.uniforms.radialScaleY.value = settings.scaleY
    // Zoom: 100% = 1.0, maps to reasonable canvas coverage
    this.uniforms.radialZoom.value = (settings.zoom ?? 100) / 100
    this.uniforms.radialRepeatMode.value = settings.repeatMode === 'mirror' ? 1 : 0
    // Shape variants
    const shapeIndex: Record<string, number> = { circle: 0, roundedRect: 1, squircle: 2, pill: 3 }
    this.uniforms.radialShape.value = shapeIndex[settings.shape] ?? 0
    this.uniforms.radialCornerRadius.value = (settings.cornerRadius ?? 30) / 100
    this.uniforms.radialShapeAspect.value = settings.shapeAspect ?? 1.0
  }
  
  setConicSettings(settings: ConicSettings): void {
    this.uniforms.conicPosX.value = settings.positionX / 100
    this.uniforms.conicPosY.value = 1 - (settings.positionY / 100)
    this.uniforms.conicStartAngle.value = degreesToRadians(settings.startAngle)
    this.uniforms.conicRepeatCount.value = settings.repeatCount
  }
  
  setDiamondSettings(settings: DiamondSettings): void {
    this.uniforms.diamondPosX.value = settings.positionX / 100
    this.uniforms.diamondPosY.value = 1 - (settings.positionY / 100)
    this.uniforms.diamondScaleX.value = settings.scaleX
    this.uniforms.diamondScaleY.value = settings.scaleY
    this.uniforms.diamondRotation.value = degreesToRadians(settings.rotation)
    this.uniforms.diamondRepeatMode.value = settings.repeatMode === 'mirror' ? 1 : 0
    const blendMap: Record<string, number> = { normal: 0, soft: 1, vivid: 2 }
    this.uniforms.diamondBlendStyle.value = blendMap[settings.blendStyle] ?? 0
  }
  
  setSpiralSettings(settings: SpiralSettings): void {
    this.uniforms.spiralTightness.value = settings.tightness
    this.uniforms.spiralDirection.value = settings.direction === 'cw' ? 1.0 : -1.0
    this.uniforms.spiralDecay.value = settings.decay
    this.uniforms.spiralPosX.value = settings.positionX / 100
    this.uniforms.spiralPosY.value = 1 - (settings.positionY / 100)
    this.uniforms.spiralColorSpread.value = settings.colorSpread
    this.uniforms.spiralArmWidth.value = settings.armWidth
  }
  
  setAuroraSettings(settings: AuroraSettings): void {
    this.uniforms.auroraWaveCount.value = settings.waveCount
    this.uniforms.auroraFlow.value = settings.flow
    this.uniforms.auroraSoftness.value = settings.softness
    this.uniforms.auroraVerticalPos.value = settings.verticalPosition / 100
    this.uniforms.auroraRotation.value = settings.rotation * Math.PI / 180 // Convert to radians
    this.uniforms.auroraSpread.value = settings.spread
    this.uniforms.auroraIntensity.value = settings.intensity
    this.uniforms.auroraBlend.value = (settings.blend ?? 50) / 100 // Wire blend uniform
  }
  
  setStripesSettings(settings: StripesSettings): void {
    this.uniforms.stripesCount.value = settings.stripeCount
    this.uniforms.stripesAngle.value = degreesToRadians(settings.angle)
    this.uniforms.stripesSharpness.value = settings.sharpness
    this.uniforms.stripesFade.value = (settings.fade ?? 0) / 100 // Wire fade uniform
    this.uniforms.stripesOffset.value = (settings.offset ?? 0) / 100 // Wire offset uniform
  }
  
  setFoldedSettings(settings: FoldedSettings): void {
    this.uniforms.foldedCount.value = settings.foldCount
    this.uniforms.foldedAngle.value = degreesToRadians(settings.foldAngle)
    this.uniforms.foldedLightDir.value = degreesToRadians(settings.lightDirection)
    this.uniforms.foldedSoftness.value = settings.softness
    this.uniforms.foldedDepth.value = (settings.depth ?? 50) / 100 // Wire depth uniform
  }
  
  setReverbSettings(settings: ReverbSettings): void {
    const shapeMap: Record<string, number> = {
      circle: 0, square: 1, triangle: 2, hexagon: 3, star: 4, diamond: 5, heart: 6
    }
    const spacingMap: Record<string, number> = { equal: 0, expand: 1, contract: 2 }
    
    this.uniforms.reverbShape.value = shapeMap[settings.shape] ?? 0
    this.uniforms.reverbRings.value = settings.rings
    this.uniforms.reverbSpacing.value = spacingMap[settings.spacing] ?? 0
    this.uniforms.reverbThickness.value = settings.thickness
    this.uniforms.reverbZoom.value = settings.zoom
    this.uniforms.reverbDecay.value = settings.decay
    this.uniforms.reverbBlend.value = settings.blend
    this.uniforms.reverbPosX.value = settings.positionX / 100
    this.uniforms.reverbPosY.value = 1 - (settings.positionY / 100)
  }
  
  setMaterialSettings(materials: MaterialState): void {
    // Iridescent
    this.uniforms.matIridescentEnabled.value = materials.iridescent?.enabled ? 1 : 0
    this.uniforms.matIridescentIntensity.value = materials.iridescent?.intensity ?? 50
    this.uniforms.matIridescentScale.value = materials.iridescent?.scale ?? 10
    this.uniforms.matIridescentShift.value = materials.iridescent?.shift ?? 0
    
    // Metallic
    this.uniforms.matMetallicEnabled.value = materials.metallic?.enabled ? 1 : 0
    this.uniforms.matMetallicIntensity.value = materials.metallic?.intensity ?? 50
    this.uniforms.matMetallicHighlight.value = materials.metallic?.highlight ?? 50
    this.uniforms.matMetallicContrast.value = materials.metallic?.contrast ?? 50
    
    // Holographic
    this.uniforms.matHolographicEnabled.value = materials.holographic?.enabled ? 1 : 0
    this.uniforms.matHolographicIntensity.value = materials.holographic?.intensity ?? 50
    this.uniforms.matHolographicDensity.value = materials.holographic?.density ?? 8
    this.uniforms.matHolographicAngle.value = materials.holographic?.angle ?? 45
    
    // Velvet
    this.uniforms.matVelvetEnabled.value = materials.velvet?.enabled ? 1 : 0
    this.uniforms.matVelvetIntensity.value = materials.velvet?.intensity ?? 50
    this.uniforms.matVelvetDepth.value = materials.velvet?.depth ?? 50
    this.uniforms.matVelvetGlow.value = materials.velvet?.glow ?? 50
  }
  
  setWarpSettings(warp: WarpState): void {
    const directionMap: Record<string, number> = { horizontal: 0, vertical: 1, diagonal: 2 }
    
    // Bend - "The Curve" - curves like wrapping around a cylinder
    this.uniforms.u_bendAmount.value = warp.bend.enabled ? warp.bend.amount : 0
    this.uniforms.u_bendAxis.value = warp.bend.axis
    this.uniforms.u_bendPinch.value = warp.bend.pinch
    
    // Twist - "The Spiral" - rotates around a center point
    this.uniforms.u_twistAmount.value = warp.twist.enabled ? warp.twist.amount : 0
    this.uniforms.u_twistRadius.value = warp.twist.radius
    this.uniforms.u_twistCenter.value.set(warp.twist.centerX / 100, 1 - warp.twist.centerY / 100)
    
    // Sphere - "The Lens" - fisheye/barrel distortion
    this.uniforms.u_sphereAmount.value = warp.sphere.enabled ? warp.sphere.amount : 0
    this.uniforms.u_sphereRadius.value = warp.sphere.radius
    this.uniforms.u_sphereCenter.value.set(warp.sphere.centerX / 100, 1 - warp.sphere.centerY / 100)
    
    // Wave - "The Undulation" - sinusoidal flow
    this.uniforms.u_waveAmplitude.value = warp.wave.enabled ? warp.wave.amplitude : 0
    this.uniforms.u_waveFrequency.value = warp.wave.frequency
    this.uniforms.u_waveDirection.value = directionMap[warp.wave.direction] ?? 0
    this.uniforms.u_waveRotation.value = warp.wave.rotation
    
    // Bulge - "The Push/Pull" - expands/contracts from a point
    this.uniforms.u_bulgeAmount.value = warp.bulge.enabled ? warp.bulge.amount : 0
    this.uniforms.u_bulgeRadius.value = warp.bulge.radius
    this.uniforms.u_bulgeCenter.value.set(warp.bulge.centerX / 100, 1 - warp.bulge.centerY / 100)
    
    // Ripple - "The Stone in Water" - concentric waves
    this.uniforms.u_rippleAmplitude.value = warp.ripple.enabled ? warp.ripple.amplitude : 0
    this.uniforms.u_rippleFrequency.value = warp.ripple.frequency
    this.uniforms.u_rippleCenter.value.set(warp.ripple.centerX / 100, 1 - warp.ripple.centerY / 100)
    this.uniforms.u_rippleDecay.value = warp.ripple.decay
    this.uniforms.u_rippleRotation.value = warp.ripple.rotation
    
    // Blur - "The Softener" - post-processing (only when enabled)
    this.uniforms.u_blurAmount.value = warp.blur.enabled ? warp.blur.amount : 0
  }
  
  setGeometryEffectsSettings(effects: GeometryEffectsState): void {
    const patternMap: Record<string, number> = { alternating: 0, progressive: 1, wave: 2 }
    const surfaceTypeMap: Record<string, number> = { sphere: 0, cylinder: 1, saddle: 2 }
    
    // Grid Refraction - Glass tiles effect
    this.uniforms.u_gridEnabled.value = effects.grid.enabled
    this.uniforms.u_gridTilesX.value = effects.grid.tilesX
    this.uniforms.u_gridTilesY.value = effects.grid.tilesY
    this.uniforms.u_gridRefraction.value = effects.grid.refraction
    this.uniforms.u_gridAngle.value = effects.grid.angle
    this.uniforms.u_gridVariation.value = effects.grid.variation
    // Grid Mesh Deformation
    this.uniforms.u_gridMeshBulge.value = effects.grid.meshBulge
    this.uniforms.u_gridMeshSkewX.value = effects.grid.meshSkewX
    this.uniforms.u_gridMeshSkewY.value = effects.grid.meshSkewY
    this.uniforms.u_gridMeshPerspective.value = effects.grid.meshPerspective
    this.uniforms.u_gridMeshPerspectiveAngle.value = effects.grid.meshPerspectiveAngle
    this.uniforms.u_gridMeshCurve.value = effects.grid.meshCurve
    this.uniforms.u_gridMeshCurveAxis.value = effects.grid.meshCurveAxis
    this.uniforms.u_gridMeshWave.value = effects.grid.meshWave
    this.uniforms.u_gridMeshWaveFreq.value = effects.grid.meshWaveFreq
    this.uniforms.u_gridMeshWaveAngle.value = effects.grid.meshWaveAngle
    this.uniforms.u_gridMeshTwist.value = effects.grid.meshTwist
    
    // Column Refraction - Louvered window effect
    this.uniforms.u_columnsEnabled.value = effects.columns.enabled
    this.uniforms.u_columnsCount.value = effects.columns.count
    this.uniforms.u_columnsOffset.value = effects.columns.offset
    this.uniforms.u_columnsAngle.value = effects.columns.angle
    this.uniforms.u_columnsPerspective.value = effects.columns.perspective
    this.uniforms.u_columnsPattern.value = patternMap[effects.columns.pattern] ?? 2
    // Column Mesh Deformation
    this.uniforms.u_columnsMeshBulge.value = effects.columns.meshBulge
    this.uniforms.u_columnsMeshSkewX.value = effects.columns.meshSkewX
    this.uniforms.u_columnsMeshSkewY.value = effects.columns.meshSkewY
    this.uniforms.u_columnsMeshCurve.value = effects.columns.meshCurve
    this.uniforms.u_columnsMeshCurveAxis.value = effects.columns.meshCurveAxis
    this.uniforms.u_columnsMeshWave.value = effects.columns.meshWave
    this.uniforms.u_columnsMeshWaveFreq.value = effects.columns.meshWaveFreq
    this.uniforms.u_columnsMeshWaveAngle.value = effects.columns.meshWaveAngle
    this.uniforms.u_columnsMeshTwist.value = effects.columns.meshTwist
    
    // 3D Depth - Dimensional bulge effect
    this.uniforms.u_depthEnabled.value = effects.depth.enabled
    this.uniforms.u_depthAmount.value = effects.depth.amount
    this.uniforms.u_depthCenter.value.set(effects.depth.centerX / 100, 1 - effects.depth.centerY / 100)
    this.uniforms.u_depthFalloff.value = effects.depth.falloff
    this.uniforms.u_depthShading.value = effects.depth.shading
    // Depth Dimensionality
    this.uniforms.u_depthSurfaceType.value = surfaceTypeMap[effects.depth.surfaceType] ?? 0
    this.uniforms.u_depthSurfaceWave.value = effects.depth.surfaceWave
    this.uniforms.u_depthWaveScale.value = effects.depth.waveScale
  }
  
  setEffectsSettings(effects: EffectsState): void {
    // Color Adjustments
    this.uniforms.u_colorEnabled.value = effects.color.enabled
    this.uniforms.u_brightness.value = effects.color.brightness
    this.uniforms.u_contrast.value = effects.color.contrast
    this.uniforms.u_saturation.value = effects.color.saturation
    this.uniforms.u_hueShift.value = effects.color.hueShift
    
    // Glow
    this.uniforms.u_glowEnabled.value = effects.glow.enabled
    this.uniforms.u_glowAmount.value = effects.glow.amount
    this.uniforms.u_glowThreshold.value = effects.glow.threshold
    this.uniforms.u_glowRadius.value = effects.glow.radius
    
    // Chromatic Aberration
    this.uniforms.u_chromaticEnabled.value = effects.chromatic.enabled
    this.uniforms.u_chromaticAmount.value = effects.chromatic.amount
    this.uniforms.u_chromaticAngle.value = effects.chromatic.angle
    
    // Vignette
    this.uniforms.u_vignetteEnabled.value = effects.vignette.enabled
    this.uniforms.u_vignetteAmount.value = effects.vignette.amount
    this.uniforms.u_vignetteSoftness.value = effects.vignette.softness
    this.uniforms.u_vignetteRoundness.value = effects.vignette.roundness
    this.uniforms.u_vignetteInvert.value = effects.vignette.invert
    
    // Posterize
    this.uniforms.u_posterizeEnabled.value = effects.posterize.enabled
    this.uniforms.u_posterizeLevels.value = effects.posterize.levels
    
    // Grain
    this.uniforms.u_grainEnabled.value = effects.grain.enabled
    this.uniforms.u_grainAmount.value = effects.grain.amount
    this.uniforms.u_grainSize.value = effects.grain.size
    this.uniforms.u_grainMono.value = effects.grain.mono
    
    // Dither
    this.uniforms.u_ditherEnabled.value = effects.dither.enabled
    this.uniforms.u_ditherAmount.value = effects.dither.amount
    
    // Halftone
    this.uniforms.u_halftoneEnabled.value = effects.halftone.enabled
    this.uniforms.u_halftoneIntensity.value = effects.halftone.intensity
    this.uniforms.u_halftoneScale.value = effects.halftone.scale
    this.uniforms.u_halftoneSoftness.value = effects.halftone.softness
    
    // Scanlines
    this.uniforms.u_scanlinesEnabled.value = effects.scanlines.enabled
    this.uniforms.u_scanlinesIntensity.value = effects.scanlines.intensity
    this.uniforms.u_scanlinesDensity.value = effects.scanlines.density
    
    // Pixelate
    this.uniforms.u_pixelateEnabled.value = effects.pixelate.enabled
    this.uniforms.u_pixelateSize.value = effects.pixelate.size
    
    // ASCII
    if (effects.ascii) {
      // Core settings
      this.uniforms.u_asciiEnabled.value = effects.ascii.enabled
      this.uniforms.u_asciiDensity.value = effects.ascii.density
      // Use Array.from to correctly count Unicode characters (emojis, blocks, etc.)
      this.uniforms.u_asciiCharCount.value = Array.from(effects.ascii.characters).length
      this.uniforms.u_asciiColored.value = effects.ascii.colorMode === 'colored'
      this.uniforms.u_asciiMonoColor.value = hexToVec3(effects.ascii.monoColor)
      this.uniforms.u_asciiBackground.value = hexToVec3(effects.ascii.backgroundColor)
      this.uniforms.u_asciiInvert.value = effects.ascii.invert
      this.uniforms.u_asciiLockGrid.value = effects.ascii.lockGrid ?? false

      // Enhanced settings
      this.uniforms.u_asciiRotation.value = effects.ascii.rotation ?? 0
      this.uniforms.u_asciiLineHeight.value = (effects.ascii.lineHeight ?? 100) / 100
      this.uniforms.u_asciiLetterSpacing.value = (effects.ascii.letterSpacing ?? 100) / 100

      // Shadow
      if (effects.ascii.shadow) {
        this.uniforms.u_asciiShadowEnabled.value = effects.ascii.shadow.enabled
        this.uniforms.u_asciiShadowColor.value = hexToVec3(effects.ascii.shadow.color)
        this.uniforms.u_asciiShadowOffsetX.value = effects.ascii.shadow.offsetX
        this.uniforms.u_asciiShadowOffsetY.value = effects.ascii.shadow.offsetY
        this.uniforms.u_asciiShadowBlur.value = effects.ascii.shadow.blur / 100
      }

      // Glow
      if (effects.ascii.glow) {
        this.uniforms.u_asciiGlowEnabled.value = effects.ascii.glow.enabled
        this.uniforms.u_asciiGlowAmount.value = effects.ascii.glow.amount
        this.uniforms.u_asciiGlowRadius.value = effects.ascii.glow.radius / 100
      }

      // Edge detection
      if (effects.ascii.edge) {
        this.uniforms.u_asciiEdgeMode.value = effects.ascii.edge.enabled
        this.uniforms.u_asciiEdgeThreshold.value = effects.ascii.edge.threshold / 100
      }

      // Perspective
      if (effects.ascii.perspective) {
        this.uniforms.u_asciiPerspective.value = effects.ascii.perspective.enabled
        this.uniforms.u_asciiPerspectiveX.value = effects.ascii.perspective.tiltX
        this.uniforms.u_asciiPerspectiveY.value = effects.ascii.perspective.tiltY
      }
    }

    // Dot Matrix
    if (effects.dotMatrix) {
      const shapeMap: Record<string, number> = { circle: 0, square: 1, diamond: 2 }
      const colorModeMap: Record<string, number> = { colored: 0, mono: 1, duotone: 2 }
      
      this.uniforms.u_dotMatrixEnabled.value = effects.dotMatrix.enabled
      this.uniforms.u_dotMatrixShape.value = shapeMap[effects.dotMatrix.shape] ?? 0
      this.uniforms.u_dotMatrixDensity.value = effects.dotMatrix.density
      this.uniforms.u_dotMatrixSizeMin.value = effects.dotMatrix.sizeMin / 100
      this.uniforms.u_dotMatrixSizeMax.value = effects.dotMatrix.sizeMax / 100
      this.uniforms.u_dotMatrixColorMode.value = colorModeMap[effects.dotMatrix.colorMode] ?? 0
      this.uniforms.u_dotMatrixMonoColor.value = hexToVec3(effects.dotMatrix.monoColor)
      this.uniforms.u_dotMatrixDuoDark.value = hexToVec3(effects.dotMatrix.duotoneDark)
      this.uniforms.u_dotMatrixDuoLight.value = hexToVec3(effects.dotMatrix.duotoneLight)
      this.uniforms.u_dotMatrixBackground.value = hexToVec3(effects.dotMatrix.backgroundColor)
      this.uniforms.u_dotMatrixSoftness.value = effects.dotMatrix.softness / 100
      this.uniforms.u_dotMatrixInvert.value = effects.dotMatrix.invert
      this.uniforms.u_dotMatrixLockGrid.value = effects.dotMatrix.lockGrid ?? false
      this.uniforms.u_dotMatrixGap.value = (effects.dotMatrix.gap ?? 0) / 100
      this.uniforms.u_dotMatrixTexture.value = (effects.dotMatrix.texture ?? 0) / 100
    }
  }
  
  // Lava Lamp - Organic Warp settings
  setLavaLampEnabled(enabled: boolean): void {
    this.uniforms.u_lavaLampEnabled.value = enabled
  }
  
  setLavaLampIntensity(intensity: number): void {
    // intensity is 0-1 for shader
    this.uniforms.u_lavaLampIntensity.value = Math.min(Math.max(intensity, 0), 1)
  }
  
  setLavaLampBlobCount(count: number): void {
    this.uniforms.u_lavaLampBlobCount.value = Math.min(Math.max(count, 2), 6)
  }
  
  setLavaLampTime(time: number): void {
    this.uniforms.u_lavaLampTime.value = time
  }
  
  setLavaLampBlobPosition(index: number, x: number, y: number): void {
    if (index >= 0 && index < 6) {
      this.uniforms.u_lavaLampPositions.value[index].set(x, y)
    }
  }
  
  setLavaLampBlobSize(index: number, size: number): void {
    if (index >= 0 && index < 6) {
      this.uniforms.u_lavaLampSizes.value[index] = size
    }
  }
  
  // === GETTERS ===
  
  getMaterial(): THREE.ShaderMaterial | null { 
    return this.material 
  }
  
  getUniforms(): GradientUniforms { 
    return this.uniforms 
  }
  
  getCurrentType(): GradientType {
    return this.currentType
  }
  
  // === CLEANUP ===
  
  dispose(): void {
    if (this.material) {
      this.material.dispose()
      this.material = null
    }
    if (this.placeholderTexture) {
      this.placeholderTexture.dispose()
    }
  }
}

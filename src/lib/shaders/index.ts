/**
 * Shaders Module
 * 
 * Consolidated shader exports for the gradient engine
 */

// Vertex shader
export { baseVertexShader } from './base.vert'

// Utility shaders
export { colorUtils } from './utils/color.glsl'
export { easingUtils } from './utils/easing.glsl'
export { sdfUtils } from './utils/sdf.glsl'
export { gradientUtils } from './utils/gradient.glsl'
export { materialUtils, materialUniforms, materialFunctions } from './utils/materials.glsl'
export { lavaLampUtils, lavaLampUniforms, lavaLampFunctions } from './utils/lavaLamp.glsl'

// Gradient type shaders
export {
  linearGradientShader,
  radialGradientShader,
  conicGradientShader,
  diamondGradientShader,
  spiralGradientShader,
  auroraGradientShader,
  stripesGradientShader,
  foldedGradientShader,
  reverbGradientShader,
} from './types'


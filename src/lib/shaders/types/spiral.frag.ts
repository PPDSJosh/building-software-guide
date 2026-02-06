/**
 * Spiral Gradient Shader
 * Uses UV distortion for smooth, colorful warping
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const spiralGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Spiral-specific uniforms
uniform float aspectRatio;
uniform float spiralTightness;
uniform float spiralDirection;
uniform float spiralDecay;
uniform float spiralPosX;
uniform float spiralPosY;
uniform float spiralColorSpread;
uniform float spiralArmWidth;

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

float getSpiralT(vec2 uv) {
    vec2 center = vec2(spiralPosX, spiralPosY);
    vec2 delta = uv - center;
    delta.x *= aspectRatio;
    
    float dist = length(delta);
    float a = atan(delta.y, delta.x) * spiralDirection;
    float spiral = a / 6.28318530 + dist * spiralTightness * spiralColorSpread;
    float t = fract(spiral);
    
    float decayFactor = 1.0 - dist * 1.5 * spiralDecay;
    decayFactor = max(decayFactor, 0.0);
    return mix(0.5, t, decayFactor);
}

vec3 sampleGradientAt(vec2 uv) {
    float t = getSpiralT(uv);
    return getGradientColor(t);
}

vec3 applyChromatic(vec2 uv) {
    if (u_chromaticAmount < 0.1) return sampleGradientAt(uv);
    vec2 offset = getChromaticOffset(u_chromaticAmount, u_chromaticAngle);
    offset += getChromaticOffsetRadial(uv, u_chromaticAmount * 0.5);
    vec3 colorR = sampleGradientAt(uv + offset);
    vec3 colorG = sampleGradientAt(uv);
    vec3 colorB = sampleGradientAt(uv - offset);
    return vec3(colorR.r, colorG.g, colorB.b);
}

void main() {
    vec2 geometryUv = applyAllGeometry(vUv);
    vec2 warpedUv = applyAllWarps(geometryUv);
    
    // Apply lava lamp organic warp
    warpedUv = applyLavaLampWarp(warpedUv);
    
    // Apply pixelate before gradient sampling
    if (u_pixelateEnabled && u_pixelateSize > 0.0) {
        warpedUv = applyPixelateUV(warpedUv, u_pixelateSize);
    }
    
    vec3 color = u_chromaticEnabled ? applyChromatic(warpedUv) : sampleGradientAt(warpedUv);
    
    color = applyGeometryBevel(color, vUv);
    
    if (u_depthEnabled && u_depthShading) {
        color = apply3DShading(color, vUv, u_depthAmount, u_depthCenter);
    }
    
    color = applyMaterials(color, warpedUv);
    color = applyAllEffects(color, vUv, gl_FragCoord.xy);
    
    gl_FragColor = vec4(color, 1.0);
}
`


/**
 * Folded Gradient Shader
 * Creates an accordion-fold paper effect with lighting
 * Uses UV distortion for smooth, colorful warping
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const foldedGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Folded-specific uniforms
uniform float foldedCount;
uniform float foldedAngle;
uniform float foldedLightDir;
uniform float foldedSoftness;
uniform float foldedDepth;

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

// Returns gradient color and lighting value for folded effect
vec4 sampleFoldedAt(vec2 uv) {
    vec2 p = uv - 0.5;
    float c = cos(foldedAngle), s = sin(foldedAngle);
    p = vec2(p.x * c - p.y * s, p.x * s + p.y * c) + 0.5;
    
    float x = p.x * foldedCount;
    float foldIndex = floor(x);
    float foldPhase = fract(x);
    
    float foldNormal = foldPhase < 0.5 ? 1.0 : -1.0;
    float lightX = cos(foldedLightDir);
    float lightingVal = foldNormal * lightX * 0.5 + 0.5;
    
    float edgeSoft = mix(0.3, 0.05, 1.0 - foldedSoftness);
    float t = smoothstep(0.5 - edgeSoft, 0.5 + edgeSoft, foldPhase);
    
    float colorT = mod(foldIndex, 2.0) == 0.0 ? t : 1.0 - t;
    colorT = mix(p.y, colorT, 0.6);
    
    vec3 color = getGradientColor(colorT);
    return vec4(color, lightingVal);
}

vec3 sampleGradientAt(vec2 uv) {
    vec4 result = sampleFoldedAt(uv);
    vec3 color = result.rgb;
    float lightingVal = result.a;

    // Depth controls the intensity of the 3D lighting effect
    // depth = 0: flat appearance (no lighting)
    // depth = 1: maximum 3D depth effect
    float baseLightIntensity = mix(0.15, 0.35, 1.0 - foldedSoftness);
    float lightIntensity = baseLightIntensity * foldedDepth;

    color *= (1.0 - lightIntensity) + lightingVal * lightIntensity * 2.0;
    return color;
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


/**
 * Stripes Gradient Shader
 * Uses UV distortion for smooth, colorful warping
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const stripesGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Stripes-specific uniforms
uniform float stripesCount;
uniform float stripesAngle;
uniform float stripesSharpness;
uniform float stripesFade;
uniform float stripesOffset;

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

vec3 sampleGradientAt(vec2 uv) {
    vec2 center = vec2(0.5);
    vec2 p = uv - center;
    float c = cos(stripesAngle), s = sin(stripesAngle);
    p = vec2(p.x * c - p.y * s, p.x * s + p.y * c) + center;

    // Apply offset to shift stripes position
    float x = p.x * stripesCount + stripesOffset * stripesCount;
    float stripe = fract(x);

    // Edge sharpness with fade modifier
    // Fade softens the stripe edges (0 = sharp based on sharpness, 1 = fully soft)
    float baseEdge = mix(0.4, 0.01, stripesSharpness);
    float edge = mix(baseEdge, 0.5, stripesFade);
    stripe = smoothstep(0.0, edge, stripe) * (1.0 - smoothstep(1.0 - edge, 1.0, stripe));

    float t = mix(p.y, stripe, 0.7);
    t = clamp(t, 0.0, 1.0);

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


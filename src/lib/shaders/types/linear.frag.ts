/**
 * Linear Gradient Shader
 * Uses UV distortion for smooth, colorful warping
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const linearGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Linear-specific uniforms
uniform float angle;
uniform int linearRepeatMode;
uniform float u_linearOffsetX;
uniform float u_linearOffsetY;
uniform float u_linearScale;

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

// Get gradient position for linear type
float getLinearT(vec2 uv) {
    // Apply offset (shift gradient position)
    vec2 offsetUv = uv + vec2(u_linearOffsetX, u_linearOffsetY);

    vec2 direction = vec2(cos(angle), sin(angle));

    // Apply scale (compress/expand gradient)
    // Scale < 1 compresses (gradient repeats), scale > 1 expands (gradient stretches)
    float t = dot(offsetUv - 0.5, direction) * 0.707106781 / u_linearScale + 0.5;

    return applyRepeat(t, linearRepeatMode);
}

// Sample gradient at a given UV (for chromatic aberration)
vec3 sampleGradientAt(vec2 uv) {
    float t = getLinearT(uv);
    return getGradientColor(t);
}

// Apply chromatic aberration by sampling gradient at offset UVs
vec3 applyChromatic(vec2 uv) {
    if (u_chromaticAmount < 0.1) {
        return sampleGradientAt(uv);
    }
    
    // Calculate offset based on amount and angle
    vec2 offset = getChromaticOffset(u_chromaticAmount, u_chromaticAngle);
    
    // Add radial component (increases toward edges)
    vec2 radialOffset = getChromaticOffsetRadial(uv, u_chromaticAmount * 0.5);
    offset += radialOffset;
    
    // Sample at offset positions for each channel
    vec2 uvR = uv + offset;
    vec2 uvG = uv;
    vec2 uvB = uv - offset;
    
    // Get colors at each position
    vec3 colorR = sampleGradientAt(uvR);
    vec3 colorG = sampleGradientAt(uvG);
    vec3 colorB = sampleGradientAt(uvB);
    
    // Combine: R from red-offset, G from center, B from blue-offset
    return vec3(colorR.r, colorG.g, colorB.b);
}

void main() {
    // 1. Apply geometry effects first (structured subdivision)
    vec2 geometryUv = applyAllGeometry(vUv);
    
    // 2. Apply warp effects (smooth distortion)
    vec2 warpedUv = applyAllWarps(geometryUv);
    
    // 3. Apply lava lamp organic warp (flowing distortion)
    warpedUv = applyLavaLampWarp(warpedUv);
    
    // 4. Apply pixelate BEFORE gradient sampling (if enabled)
    if (u_pixelateEnabled && u_pixelateSize > 0.0) {
        warpedUv = applyPixelateUV(warpedUv, u_pixelateSize);
    }
    
    // 5. Sample gradient - with chromatic aberration if enabled
    vec3 color;
    if (u_chromaticEnabled) {
        color = applyChromatic(warpedUv);
    } else {
        color = sampleGradientAt(warpedUv);
    }
    
    // 6. Apply geometry bevel shading
    color = applyGeometryBevel(color, vUv);
    
    // 7. Apply 3D depth shading if enabled
    if (u_depthEnabled && u_depthShading) {
        color = apply3DShading(color, vUv, u_depthAmount, u_depthCenter);
    }
    
    // 8. Apply materials
    color = applyMaterials(color, warpedUv);
    
    // 9. Apply effects (color adjustments, glow, vignette, grain, etc)
    color = applyAllEffects(color, vUv, gl_FragCoord.xy);
    
    gl_FragColor = vec4(color, 1.0);
}
`


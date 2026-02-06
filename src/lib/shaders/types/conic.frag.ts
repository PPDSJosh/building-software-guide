/**
 * Conic (Angular) Gradient Shader
 * Uses UV distortion for smooth, colorful warping
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const conicGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Conic-specific uniforms
uniform float conicPosX;
uniform float conicPosY;
uniform float conicStartAngle;
uniform float conicRepeatCount;

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

float getConicT(vec2 uv) {
    // Use animated center if different from base position
    float centerX = conicPosX;
    float centerY = conicPosY;
    
    // Apply animated gradient center offset (u_gradientCenterX/Y are 0-100, convert to 0-1)
    if (u_gradientCenterX != 50.0) {
        centerX = u_gradientCenterX / 100.0;
    }
    if (u_gradientCenterY != 50.0) {
        centerY = u_gradientCenterY / 100.0;
    }
    
    vec2 delta = uv - vec2(centerX, centerY);
    float a = atan(delta.y, delta.x);
    
    // Apply conic offset (u_conicOffset is in degrees, convert to radians)
    float offsetRad = u_conicOffset * 0.01745329; // PI / 180
    
    float t = (a + 3.14159265 - conicStartAngle - offsetRad) / 6.28318530;
    return fract(t * conicRepeatCount);
}

vec3 sampleGradientAt(vec2 uv) {
    float t = getConicT(uv);
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


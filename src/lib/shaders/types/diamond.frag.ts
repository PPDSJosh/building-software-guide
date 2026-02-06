/**
 * Diamond Gradient Shader
 * Uses UV distortion for smooth, colorful warping
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const diamondGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Diamond-specific uniforms
uniform float diamondPosX;
uniform float diamondPosY;
uniform float diamondScaleX;
uniform float diamondScaleY;
uniform float diamondRotation;
uniform int diamondRepeatMode;
uniform int diamondBlendStyle;
uniform float aspectRatio;

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

float getDiamondT(vec2 uv) {
    vec2 delta = uv - vec2(diamondPosX, diamondPosY);
    delta.x *= aspectRatio;
    
    float c = cos(diamondRotation), s = sin(diamondRotation);
    delta = vec2(delta.x * c - delta.y * s, delta.x * s + delta.y * c);
    
    delta.x /= max(diamondScaleX, 0.01);
    delta.y /= max(diamondScaleY, 0.01);
    
    float t = (abs(delta.x) + abs(delta.y)) * 1.41421356;
    return applyRepeat(t, diamondRepeatMode);
}

vec3 sampleGradientAt(vec2 uv) {
    float t = getDiamondT(uv);
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
    
    // Apply blend styles
    if (diamondBlendStyle == 1) {
        color = pow(color, vec3(0.9));
    } else if (diamondBlendStyle == 2) {
        float lum = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(lum), color, 1.4);
        color = clamp(color, 0.0, 1.0);
    }
    
    color = applyGeometryBevel(color, vUv);
    
    if (u_depthEnabled && u_depthShading) {
        color = apply3DShading(color, vUv, u_depthAmount, u_depthCenter);
    }
    
    color = applyMaterials(color, warpedUv);
    color = applyAllEffects(color, vUv, gl_FragCoord.xy);
    
    gl_FragColor = vec4(color, 1.0);
}
`


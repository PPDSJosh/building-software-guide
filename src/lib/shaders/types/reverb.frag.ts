/**
 * Reverb Gradient Shader
 * Concentric rings using various SDF shapes
 * Uses UV distortion for smooth, colorful warping
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { sdfUtils } from '../utils/sdf.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const reverbGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Reverb-specific uniforms
uniform float aspectRatio;
uniform int reverbShape;
uniform float reverbRings;
uniform int reverbSpacing;
uniform float reverbThickness;
uniform float reverbZoom;
uniform float reverbDecay;
uniform float reverbBlend;
uniform float reverbPosX;
uniform float reverbPosY;

${gradientUtils}
${sdfUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

vec3 sampleGradientAt(vec2 uv) {
    vec2 center = vec2(reverbPosX, reverbPosY);
    vec2 p = uv - center;
    p.x *= aspectRatio;
    
    float unzoomedDist = length(p);
    p /= max(reverbZoom, 0.1);
    
    float dist = getShapeRingDistance(p, reverbShape);
    float scaledDist = dist * reverbRings;
    
    float spacedDist = scaledDist;
    if (reverbSpacing == 1) {
        spacedDist = pow(scaledDist / reverbRings, 1.4) * reverbRings;
    } else if (reverbSpacing == 2) {
        spacedDist = pow(scaledDist / reverbRings, 0.7) * reverbRings;
    }
    
    float ringPos = fract(spacedDist);
    float halfThick = reverbThickness * 0.5;
    float edge = 0.02 + reverbBlend * 0.75 * 3.0;
    
    float ringValue = smoothstep(0.5 - halfThick - edge, 0.5 - halfThick + edge * 0.5, ringPos) *
                      (1.0 - smoothstep(0.5 + halfThick - edge * 0.5, 0.5 + halfThick + edge, ringPos));
    
    float t = ringPos;
    float decayFactor = 1.0 - smoothstep(0.0, 0.7, unzoomedDist) * reverbDecay;
    
    t = mix(0.5, t, ringValue * decayFactor);
    t = quintic(t);
    
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


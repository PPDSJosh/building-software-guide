/**
 * Aurora Gradient Shader
 * Creates aurora borealis-like ribbon effects
 * Static by default - animate via the Animation panel
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const auroraGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Aurora-specific uniforms
uniform float auroraWaveCount;
uniform float auroraFlow;
uniform float auroraSoftness;
uniform float auroraVerticalPos;
uniform float auroraRotation;
uniform float auroraSpread;
uniform float auroraIntensity;
uniform float auroraBlend;

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

// Aurora gradient sampling at a given UV
vec3 sampleGradientAt(vec2 uv) {
    // Apply rotation to UV space
    vec2 center = vec2(0.5, 0.5);
    vec2 rotatedUv = uv - center;
    float c = cos(auroraRotation);
    float s = sin(auroraRotation);
    rotatedUv = vec2(rotatedUv.x * c - rotatedUv.y * s, rotatedUv.x * s + rotatedUv.y * c);
    rotatedUv += center;
    
    float yBase = auroraVerticalPos;
    float result = 0.0;
    
    float flowNorm = auroraFlow * 0.01;
    float softnessNorm = auroraSoftness * 0.01;
    float spreadNorm = auroraSpread * 0.01;
    
    // Static aurora - no time-based animation
    // Animation can be added via the animation panel by animating auroraFlow or other properties
    for (float i = 0.0; i < 8.0; i++) {
        if (i >= auroraWaveCount) break;
        
        float waveOffset = i / max(auroraWaveCount, 1.0);
        float freq = 1.0 + i * 0.4 + flowNorm * 2.0;
        
        // Static phase offset based on wave index (creates variation without animation)
        float phase = i * 1.5;
        
        float wave = sin(rotatedUv.x * freq * 3.14159 + phase) * flowNorm * 0.25;
        wave += sin(rotatedUv.x * freq * 1.7 + phase * 1.4) * flowNorm * 0.15;
        wave += sin(rotatedUv.x * freq * 0.6 + phase * 0.8) * flowNorm * 0.1;
        
        float spreadOffset = (waveOffset - 0.5) * spreadNorm * 0.8;
        float ribbonY = yBase + spreadOffset + wave;
        
        float distToRibbon = abs(rotatedUv.y - ribbonY);
        float ribbonWidth = 0.04 + softnessNorm * 0.2;
        float softEdge = exp(-distToRibbon * distToRibbon / (ribbonWidth * ribbonWidth));
        
        float ribbonStrength = 1.0 - waveOffset * 0.2;
        result += softEdge * ribbonStrength;
    }
    
    result = clamp(result, 0.0, 1.5);
    result = smoothstep(0.0, 1.2, result);

    // Blend controls how much aurora ribbons mix with vertical gradient
    // auroraBlend: 0 = pure vertical gradient, 1 = full aurora ribbons
    float blendFactor = auroraBlend;
    float t = mix(rotatedUv.y, result, blendFactor * 0.7) + rotatedUv.y * (1.0 - blendFactor) * 0.3;
    t = clamp(t, 0.0, 1.0);
    
    vec3 color = getGradientColor(t);
    
    float intensityNorm = auroraIntensity * 0.01;
    float depthFactor = mix(0.85, 1.0, result);
    color *= depthFactor * intensityNorm + (1.0 - intensityNorm) * 0.5;
    
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(lum), color, 1.0 + intensityNorm * 0.2);
    
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


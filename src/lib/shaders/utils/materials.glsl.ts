/**
 * Material Effects Shader Utilities
 * 
 * Simple, predictable post-processing effects:
 * - Iridescent: Hue-shifting rainbow shimmer
 * - Metallic: Highlights and contrast boost
 * - Holographic: Rainbow line overlay
 * - Velvet: Soft depth and edge glow
 * 
 * Key principles:
 * - Keep it simple - predictable results
 * - Enhance colors, don't replace them
 * - Mix with base color using intensity control
 */

export const materialUniforms = /* glsl */ `
// Material uniforms
uniform int matIridescentEnabled;
uniform float matIridescentIntensity;
uniform float matIridescentScale;
uniform float matIridescentShift;

uniform int matMetallicEnabled;
uniform float matMetallicIntensity;
uniform float matMetallicHighlight;
uniform float matMetallicContrast;

uniform int matHolographicEnabled;
uniform float matHolographicIntensity;
uniform float matHolographicDensity;
uniform float matHolographicAngle;

uniform int matVelvetEnabled;
uniform float matVelvetIntensity;
uniform float matVelvetDepth;
uniform float matVelvetGlow;
`

export const materialFunctions = /* glsl */ `
// ========================================
// MATERIAL EFFECTS - Simple & Predictable
// ========================================

// Utility: Convert RGB to HSL
vec3 rgb2hsl(vec3 c) {
    float maxC = max(c.r, max(c.g, c.b));
    float minC = min(c.r, min(c.g, c.b));
    float l = (maxC + minC) / 2.0;
    
    if (maxC == minC) {
        return vec3(0.0, 0.0, l);
    }
    
    float d = maxC - minC;
    float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);
    float h;
    
    if (maxC == c.r) {
        h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    } else if (maxC == c.g) {
        h = (c.b - c.r) / d + 2.0;
    } else {
        h = (c.r - c.g) / d + 4.0;
    }
    h /= 6.0;
    
    return vec3(h, s, l);
}

float hue2rgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
    return p;
}

// Utility: Convert HSL to RGB
vec3 hsl2rgb(vec3 hsl) {
    float h = hsl.x;
    float s = hsl.y;
    float l = hsl.z;
    
    if (s == 0.0) {
        return vec3(l);
    }
    
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    
    float r = hue2rgb(p, q, h + 1.0/3.0);
    float g = hue2rgb(p, q, h);
    float b = hue2rgb(p, q, h - 1.0/3.0);
    
    return vec3(r, g, b);
}

// Screen blend - lightens
vec3 screenBlend(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
}

// ----------------------------------------
// IRIDESCENT - "The Shimmer"
// Oil slick / soap bubble hue shifting
// ----------------------------------------
vec3 applyIridescent(vec3 baseColor, vec2 uv) {
    if (matIridescentEnabled == 0) return baseColor;
    
    float intensity = matIridescentIntensity * 0.01;
    float scale = matIridescentScale;
    float shift = matIridescentShift * 0.01745329;
    
    // Create smooth flowing waves
    float wave1 = sin(uv.x * scale * 3.0 + uv.y * scale * 2.0 + shift);
    float wave2 = sin(uv.y * scale * 4.0 - uv.x * scale * 1.5 + shift * 0.7);
    float wave3 = sin((uv.x + uv.y) * scale * 2.5 + shift * 1.3);
    
    float combinedWave = (wave1 + wave2 * 0.7 + wave3 * 0.5) / 2.2;
    
    // Shift hue based on wave pattern
    vec3 hsl = rgb2hsl(baseColor);
    hsl.x = fract(hsl.x + combinedWave * 0.2);
    hsl.y = min(1.0, hsl.y * 1.15);
    
    vec3 iridescent = hsl2rgb(hsl);
    
    // Simple mix with intensity
    return mix(baseColor, iridescent, intensity);
}

// ----------------------------------------
// METALLIC - "The Shine"
// Polished metal with highlights
// ----------------------------------------
vec3 applyMetallic(vec3 baseColor, vec2 uv) {
    if (matMetallicEnabled == 0) return baseColor;
    
    float intensity = matMetallicIntensity * 0.01;
    float highlightAmt = matMetallicHighlight * 0.01;
    float contrastAmt = matMetallicContrast * 0.01;
    
    // Boost saturation
    vec3 hsl = rgb2hsl(baseColor);
    hsl.y = min(1.0, hsl.y * 1.3);
    vec3 saturatedColor = hsl2rgb(hsl);
    
    // Increase contrast
    vec3 result = (saturatedColor - 0.5) * (1.0 + contrastAmt * 0.5) + 0.5;
    result = clamp(result, 0.0, 1.0);
    
    // Add highlight from top-left
    vec2 lightPos = vec2(0.25, 0.25);
    float lightDist = distance(uv, lightPos);
    float highlight = 1.0 - smoothstep(0.0, 0.5, lightDist);
    highlight = pow(highlight, 2.5) * highlightAmt;
    
    // Add subtle sheen
    float sheen = sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * 0.1;
    
    result = result + highlight * 0.5 + sheen;
    result = clamp(result, 0.0, 1.0);
    
    return mix(baseColor, result, intensity);
}

// ----------------------------------------
// HOLOGRAPHIC - "Rainbow Lines"
// Simple prismatic line effect
// ----------------------------------------
vec3 applyHolographic(vec3 baseColor, vec2 uv) {
    if (matHolographicEnabled == 0) return baseColor;
    
    float intensity = matHolographicIntensity * 0.01;
    float lineCount = matHolographicDensity;
    float angle = matHolographicAngle * 0.01745329;
    
    // Rotate UV for angle
    float cosA = cos(angle);
    float sinA = sin(angle);
    vec2 rotUv = vec2(
        uv.x * cosA - uv.y * sinA,
        uv.x * sinA + uv.y * cosA
    );
    
    // Create line pattern
    float linePhase = rotUv.x * lineCount;
    float linePos = fract(linePhase);
    
    // Rainbow hue based on position
    float hue = fract(linePhase / lineCount + rotUv.y * 0.3);
    vec3 rainbow = hsl2rgb(vec3(hue, 0.8, 0.55));
    
    // Soft line mask
    float lineMask = sin(linePos * 3.14159);
    lineMask = pow(lineMask, 0.8) * 0.7;
    
    // Create holographic layer
    vec3 holoLayer = rainbow * lineMask;
    
    // Screen blend the holographic effect onto base
    vec3 result = screenBlend(baseColor, holoLayer * intensity);
    
    return mix(baseColor, result, intensity);
}

// ----------------------------------------
// VELVET - "The Depth"
// Soft depth with edge glow
// ----------------------------------------
vec3 applyVelvet(vec3 baseColor, vec2 uv) {
    if (matVelvetEnabled == 0) return baseColor;
    
    float intensity = matVelvetIntensity * 0.01;
    float depthAmt = matVelvetDepth * 0.01;
    float glowAmt = matVelvetGlow * 0.01;
    
    // Deepen and saturate the color
    vec3 hsl = rgb2hsl(baseColor);
    hsl.y = min(1.0, hsl.y * 1.25);
    hsl.z = hsl.z * (1.0 - depthAmt * 0.15);
    vec3 deepColor = hsl2rgb(hsl);
    
    // Add edge glow
    vec2 center = vec2(0.5);
    float edgeDist = length(uv - center);
    float edgeGlow = smoothstep(0.25, 0.6, edgeDist);
    edgeGlow = pow(edgeGlow, 1.5) * glowAmt * 0.5;
    
    // Glow is lighter version of base
    vec3 result = deepColor + edgeGlow * 0.3;
    result = clamp(result, 0.0, 1.0);
    
    return mix(baseColor, result, intensity);
}

// ----------------------------------------
// MAIN MATERIAL APPLICATION
// ----------------------------------------
vec3 applyMaterials(vec3 color, vec2 uv) {
    vec3 result = color;
    
    result = applyIridescent(result, uv);
    result = applyMetallic(result, uv);
    result = applyHolographic(result, uv);
    result = applyVelvet(result, uv);
    
    return result;
}
`

export const materialUtils = /* glsl */ `
${materialUniforms}
${materialFunctions}
`

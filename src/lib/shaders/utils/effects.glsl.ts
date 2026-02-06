/**
 * Effects - Post-processing adjustments
 * 
 * Applied in order for best results:
 * 1. Color adjustments (affects all subsequent effects)
 * 2. Glow (needs original brightness values)
 * 3. Chromatic aberration (two-pass, handled separately)
 * 4. Vignette
 * 5. Posterize
 * 6. Grain (adds texture on top)
 * 7. Dither (final banding reduction)
 */

// GLSL uniforms for effects
export const effectsUniforms = /* glsl */ `
// Color Adjustments
uniform bool u_colorEnabled;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_hueShift;

// Glow
uniform bool u_glowEnabled;
uniform float u_glowAmount;
uniform float u_glowThreshold;
uniform float u_glowRadius;

// Chromatic Aberration (handled in two-pass)
uniform bool u_chromaticEnabled;
uniform float u_chromaticAmount;
uniform float u_chromaticAngle;

// Vignette
uniform bool u_vignetteEnabled;
uniform float u_vignetteAmount;
uniform float u_vignetteSoftness;
uniform float u_vignetteRoundness;
uniform bool u_vignetteInvert;

// Posterize
uniform bool u_posterizeEnabled;
uniform float u_posterizeLevels;

// Grain
uniform bool u_grainEnabled;
uniform float u_grainAmount;
uniform float u_grainSize;
uniform bool u_grainMono;

// Dither
uniform bool u_ditherEnabled;
uniform float u_ditherAmount;

// Halftone
uniform bool u_halftoneEnabled;
uniform float u_halftoneIntensity;  // 0-100, controls effect strength
uniform float u_halftoneScale;      // 20-80, controls dot density
uniform float u_halftoneSoftness;   // 0-100, controls dot edge softness

// Scanlines
uniform bool u_scanlinesEnabled;
uniform float u_scanlinesIntensity;
uniform float u_scanlinesDensity;

// Pixelate
uniform bool u_pixelateEnabled;
uniform float u_pixelateSize;

// Time for animated effects
uniform float u_time;
`

// GLSL functions for effects
export const effectsFunctions = /* glsl */ `
// ============================================
// COLOR ADJUSTMENTS
// ============================================
// Note: rgb2hsl, hsl2rgb, hue2rgb are defined in materials.glsl

vec3 applyColorAdjustments(vec3 color, float brightness, float contrast, float saturation, float hueShift) {
    // Brightness (-100 to 100 -> -1 to 1)
    float b = brightness * 0.01;
    color += b;
    
    // Contrast (-100 to 100 -> 0.5 to 2.0)
    float c = (contrast * 0.01) + 1.0;
    c = max(c, 0.01);
    color = (color - 0.5) * c + 0.5;
    
    // Saturation (-100 to 100 -> 0 to 2)
    float s = (saturation * 0.01) + 1.0;
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(lum), color, s);
    
    // Hue shift (0 to 360 degrees)
    if (hueShift > 0.0) {
        vec3 hsl = rgb2hsl(color);
        hsl.x = fract(hsl.x + hueShift / 360.0);
        color = hsl2rgb(hsl);
    }
    
    return clamp(color, 0.0, 1.0);
}

// ============================================
// GLOW (Simple bloom approximation)
// ============================================

vec3 applyGlow(vec3 color, float amount, float threshold) {
    // Get brightness
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Apply threshold
    float threshNorm = threshold * 0.01;
    float glowMask = smoothstep(threshNorm, threshNorm + 0.1, lum);
    
    // Amount: 0-100 -> 0-1
    float amountNorm = amount * 0.01;
    
    // Add glow (brighten and slightly desaturate for bloom look)
    vec3 glowColor = mix(color, vec3(lum), 0.3);
    color = mix(color, color + glowColor * amountNorm, glowMask);
    
    return clamp(color, 0.0, 1.0);
}

// ============================================
// VIGNETTE
// ============================================

vec3 applyVignette(vec3 color, vec2 uv, float amount, float softness, float roundness, bool invert) {
    // Center the UV
    vec2 center = uv - 0.5;
    
    // Roundness affects aspect ratio of vignette
    float roundNorm = roundness * 0.01;
    float aspect = mix(1.0, 0.5, 1.0 - roundNorm);
    center.x *= mix(1.0, 1.7, 1.0 - roundNorm);
    
    // Distance from center
    float dist = length(center) * 2.0;
    
    // Softness controls the falloff
    float softNorm = softness * 0.01;
    float edge = mix(0.3, 1.5, softNorm);
    
    // Create vignette mask
    float vignette = smoothstep(edge, edge - softNorm * 0.8, dist);
    
    // Amount: 0-100 -> 0-1
    float amountNorm = amount * 0.01;
    
    // Apply vignette
    if (invert) {
        // Lighten edges
        color = mix(color, color + (1.0 - vignette) * 0.5, amountNorm);
    } else {
        // Darken edges
        color = mix(color, color * vignette, amountNorm);
    }
    
    return clamp(color, 0.0, 1.0);
}

// ============================================
// POSTERIZE
// ============================================

vec3 applyPosterize(vec3 color, float levels) {
    // Clamp levels to valid range
    float l = max(levels, 2.0);
    
    // Quantize each channel
    color = floor(color * l) / (l - 1.0);
    
    return clamp(color, 0.0, 1.0);
}

// ============================================
// GRAIN
// ============================================

// Hash function for pseudo-random numbers
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 applyGrain(vec3 color, vec2 uv, float amount, float size, bool mono) {
    // Scale UV for grain size
    vec2 grainUV = uv * (100.0 / max(size, 0.1));
    
    // Use continuous time for smooth grain animation
    // This prevents stuttering when export fps doesn't match grain fps
    // Multiply by large prime to get good variation without visible patterns
    float t = u_time * 60.0;
    
    // Amount: 0-100 -> 0-0.3
    float amountNorm = amount * 0.003;
    
    if (mono) {
        // Monochrome grain
        float noise = hash(grainUV + t) * 2.0 - 1.0;
        color += noise * amountNorm;
    } else {
        // Colored grain
        vec3 noise = vec3(
            hash(grainUV + t),
            hash(grainUV + t + 1.0),
            hash(grainUV + t + 2.0)
        ) * 2.0 - 1.0;
        color += noise * amountNorm;
    }
    
    return clamp(color, 0.0, 1.0);
}

// ============================================
// DITHER (Bayer matrix dithering)
// ============================================

// Compute Bayer dither value mathematically (avoids array indexing issues)
float bayerDither(vec2 pos) {
    float x = mod(pos.x, 4.0);
    float y = mod(pos.y, 4.0);
    
    // Recursive Bayer pattern calculation
    float dither = 0.0;
    float scale = 0.5;
    
    for (int i = 0; i < 2; i++) {
        float px = mod(x, 2.0);
        float py = mod(y, 2.0);
        dither += (px * 2.0 + py + px * py * 2.0) * scale;
        x = floor(x / 2.0);
        y = floor(y / 2.0);
        scale *= 0.25;
    }
    
    return (dither / 16.0) - 0.5; // Normalize to -0.5 to 0.5
}

vec3 applyDither(vec3 color, vec2 fragCoord, float amount) {
    float ditherValue = bayerDither(fragCoord);
    
    // Amount: 0-100 -> 0-0.1
    float amountNorm = amount * 0.001;
    
    color += ditherValue * amountNorm;
    
    return clamp(color, 0.0, 1.0);
}

// ═══════════════════════════════════════════════════════════════
// HALFTONE EFFECT - Color-on-color dot texture
// ═══════════════════════════════════════════════════════════════

vec3 applyHalftone(vec3 color, vec2 uv, float intensity, float scale, float softness) {
    // Classic halftone angle (45 degrees)
    float angle = 0.7854;
    float s = sin(angle);
    float c = cos(angle);
    vec2 rotUV = vec2(
        uv.x * c - uv.y * s,
        uv.x * s + uv.y * c
    );
    
    // Create dot grid
    // Scale should be HIGH for small dots (default ~60-100)
    vec2 gridUV = rotUV * scale;
    vec2 cellUV = fract(gridUV) - 0.5;
    float dist = length(cellUV);
    
    // Luminance of this pixel
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Dot size based on luminance
    // SMALL radius range - dots are subtle texture, not huge holes
    // Bright areas get slightly larger dots, dark areas smaller
    float minRadius = 0.08;
    float maxRadius = 0.22;
    float dotRadius = mix(minRadius, maxRadius, luma);
    
    // Soft edge for anti-aliasing
    float edge = 0.015 + softness * 0.04;
    
    // Dot mask: 1.0 inside dots, 0.0 in gaps
    float dotMask = smoothstep(dotRadius + edge, dotRadius - edge, dist);
    
    // ═══════════════════════════════════════════════════════════
    // KEY CHANGE: Both dots AND gaps use the gradient color
    // Dots = original color (bright)
    // Gaps = slightly darker version of the SAME color
    // ═══════════════════════════════════════════════════════════
    
    vec3 dotColor = color;                    // Full brightness in dots
    vec3 gapColor = color * 0.7;              // 70% brightness in gaps
    
    // Compose the halftone
    vec3 halftoneResult = mix(gapColor, dotColor, dotMask);
    
    // Intensity controls blend with original
    return mix(color, halftoneResult, intensity);
}

// ============================================
// SCANLINES
// ============================================

vec3 applyScanlines(vec3 color, vec2 uv, float intensity, float density) {
    float amt = intensity * 0.01;
    
    // Scanline pattern - high frequency sine wave
    float line = sin(uv.y * density * 500.0) * 0.5 + 0.5;
    line = pow(line, 2.0); // Sharpen
    
    // Darken in the "dark" lines
    float darkness = 1.0 - (1.0 - line) * amt * 0.5;
    
    return color * darkness;
}

// ============================================
// PIXELATE
// ============================================

// UV modification function - call BEFORE gradient sampling
vec2 applyPixelateUV(vec2 uv, float size) {
    if (size < 1.0) return uv;
    
    // Size 1-100 maps to increasingly large pixel blocks
    // size 1 = tiny pixels (~1% of canvas)
    // size 50 = medium pixels (~12% of canvas) 
    // size 100 = huge pixels (~25% of canvas)
    float pixelSize = size * 0.0025 + 0.005;
    
    // Snap UV to grid - creates blocky pixel art effect
    vec2 pixelatedUv = floor(uv / pixelSize) * pixelSize + pixelSize * 0.5;
    
    return pixelatedUv;
}

// Post-process version - not used, pixelation is UV-based
vec3 applyPixelate(vec3 color, vec2 uv, float pixelSize) {
    return color;
}

// ============================================
// CHROMATIC ABERRATION
// ============================================
// Note: Chromatic aberration is handled in the main shader
// because it needs to sample the gradient at offset UV positions.
// The uniforms are still declared here for consistency.

// Helper to calculate chromatic UV offsets
vec2 getChromaticOffset(float amount, float angle) {
    float offset = amount * 0.005;
    float rad = angle * 3.14159265 / 180.0;
    return vec2(cos(rad), sin(rad)) * offset;
}

// Radial chromatic offset (increases toward edges)
vec2 getChromaticOffsetRadial(vec2 uv, float amount) {
    vec2 center = vec2(0.5);
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    float offset = amount * 0.008 * dist;
    vec2 dir = dist > 0.001 ? normalize(toCenter) : vec2(0.0);
    return dir * offset;
}

// ============================================
// APPLY ALL EFFECTS
// ============================================

vec3 applyAllEffects(vec3 color, vec2 uv, vec2 fragCoord) {
    // 1. Color adjustments (affects all subsequent effects)
    if (u_colorEnabled) {
        color = applyColorAdjustments(color, u_brightness, u_contrast, u_saturation, u_hueShift);
    }
    
    // 2. Glow
    if (u_glowEnabled) {
        color = applyGlow(color, u_glowAmount, u_glowThreshold);
    }
    
    // 3. Chromatic aberration - handled in main shader (needs UV-based gradient sampling)
    
    // 4. Vignette
    if (u_vignetteEnabled) {
        color = applyVignette(color, uv, u_vignetteAmount, u_vignetteSoftness, u_vignetteRoundness, u_vignetteInvert);
    }
    
    // 5. Posterize
    if (u_posterizeEnabled) {
        color = applyPosterize(color, u_posterizeLevels);
    }
    
    // 6. Halftone
    if (u_halftoneEnabled) {
        float htIntensity = u_halftoneIntensity / 100.0;
        float htScale = u_halftoneScale;  // Higher = more dots
        float htSoftness = u_halftoneSoftness / 100.0;
        color = applyHalftone(color, uv, htIntensity, htScale, htSoftness);
    }
    
    // 7. Scanlines
    if (u_scanlinesEnabled) {
        color = applyScanlines(color, uv, u_scanlinesIntensity, u_scanlinesDensity);
    }
    
    // 8. Grain
    if (u_grainEnabled) {
        color = applyGrain(color, uv, u_grainAmount, u_grainSize, u_grainMono);
    }
    
    // 9. Dither
    if (u_ditherEnabled) {
        color = applyDither(color, fragCoord, u_ditherAmount);
    }
    
    return color;
}
`

// Combined export
export const effectsUtils = effectsUniforms + effectsFunctions


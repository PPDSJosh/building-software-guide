/**
 * Color Space Conversion Utilities
 * 
 * Includes:
 * - Linear <-> sRGB conversion
 * - RGB <-> HSV conversion
 * - Color mixing functions
 */

export const colorUtils = /* glsl */ `
// === sRGB/Linear Conversion ===

vec3 linearToSrgb(vec3 linear) {
    vec3 cutoff = step(linear, vec3(0.0031308));
    vec3 higher = 1.055 * pow(linear, vec3(1.0/2.4)) - 0.055;
    vec3 lower = linear * 12.92;
    return mix(higher, lower, cutoff);
}

vec3 srgbToLinear(vec3 srgb) {
    vec3 cutoff = step(srgb, vec3(0.04045));
    vec3 higher = pow((srgb + 0.055) / 1.055, vec3(2.4));
    vec3 lower = srgb / 12.92;
    return mix(higher, lower, cutoff);
}

// Mix colors in linear space for perceptually correct blending
vec3 mixLinear(vec3 c1, vec3 c2, float t) {
    return linearToSrgb(mix(srgbToLinear(c1), srgbToLinear(c2), t));
}

// === RGB/HSV Conversion ===

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0., -1./3., 2./3., -1.);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0., 2./3., 1./3.)) * 6. - 3.);
    vec3 rgb = c.z * mix(vec3(1.), clamp(p - 1., 0., 1.), c.y);
    return rgb;
}

// Mix colors along hue path (short or long way around the color wheel)
vec3 hueMix(vec3 c1, vec3 c2, float t, int useLongPath) {
    vec3 h1 = rgb2hsv(c1);
    vec3 h2 = rgb2hsv(c2);
    float dh = h2.x - h1.x;
    
    // Normalize to shortest path
    if (dh > 0.5) dh -= 1.0;
    if (dh < -0.5) dh += 1.0;
    
    // Check if path crosses through green zone (hue 0.2-0.45, roughly 72°-162°)
    // If neither endpoint is green and path would cross green, flip direction
    float greenMin = 0.2;
    float greenMax = 0.45;
    bool h1InGreen = h1.x >= greenMin && h1.x <= greenMax;
    bool h2InGreen = h2.x >= greenMin && h2.x <= greenMax;
    
    if (!h1InGreen && !h2InGreen) {
        // Check if interpolation crosses green zone
        float hStart = h1.x;
        float hEnd = h1.x + dh;
        float hMin = min(hStart, hEnd);
        float hMax = max(hStart, hEnd);
        
        bool crossesGreen = (hMin < greenMax && hMax > greenMin);
        
        if (crossesGreen) {
            // Flip to the other direction to avoid green
            dh = dh > 0.0 ? dh - 1.0 : dh + 1.0;
        }
    }
    
    // If long path explicitly requested, flip direction
    if (useLongPath == 1) {
        dh = dh > 0.0 ? dh - 1.0 : dh + 1.0;
    }
    
    float h = fract(h1.x + dh * t);
    float s = mix(h1.y, h2.y, t);
    float v = mix(h1.z, h2.z, t);
    return hsv2rgb(vec3(h, s, v));
}
`















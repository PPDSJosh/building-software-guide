/**
 * Dot Matrix Effect Shader
 * 
 * Renders gradients as a grid of dots where size varies with luminosity.
 * Creates LED panel / print halftone aesthetic.
 * 
 * Pipeline position: After ASCII (last effect before export)
 */

export const dotMatrixUniforms = /* glsl */ `
// Dot Matrix Effect
uniform bool u_dotMatrixEnabled;
uniform int u_dotMatrixShape;        // 0 = circle, 1 = square, 2 = diamond
uniform float u_dotMatrixDensity;    // 10-150 (dots per row)
uniform float u_dotMatrixSizeMin;    // 0-1 (minimum dot size)
uniform float u_dotMatrixSizeMax;    // 0-1 (maximum dot size)
uniform int u_dotMatrixColorMode;    // 0 = colored, 1 = mono, 2 = duotone
uniform vec3 u_dotMatrixMonoColor;   // Mono color
uniform vec3 u_dotMatrixDuoDark;     // Duotone dark color
uniform vec3 u_dotMatrixDuoLight;    // Duotone light color
uniform vec3 u_dotMatrixBackground;  // Background color (gaps between dots)
uniform float u_dotMatrixSoftness;   // 0-1 (edge blur)
uniform bool u_dotMatrixInvert;      // Invert luminosity mapping
uniform float u_dotMatrixGap;        // 0-1 (space around dots, shrinks dot size)
`

export const dotMatrixFunctions = /* glsl */ `
// ============================================
// DOT MATRIX EFFECT
// ============================================

/**
 * Calculate distance from point to different shapes
 */
float dotMatrixShapeDistance(vec2 p, int shape) {
    if (shape == 0) {
        // Circle: simple distance from center
        return length(p);
    } else if (shape == 1) {
        // Square: Chebyshev distance (max of abs coords)
        return max(abs(p.x), abs(p.y));
    } else {
        // Diamond: Manhattan distance (sum of abs coords)
        return abs(p.x) + abs(p.y);
    }
}

/**
 * Apply Dot Matrix effect to the color
 * 
 * @param color The input color from the gradient
 * @param uv The UV coordinates (0-1)
 * @param aspectRatio Canvas width/height ratio
 * @return The color with Dot Matrix effect applied
 */
vec3 applyDotMatrix(vec3 color, vec2 uv, float aspectRatio) {
    if (!u_dotMatrixEnabled) {
        return color;
    }
    
    // Calculate cell size based on density (dots per row)
    float cellWidth = 1.0 / u_dotMatrixDensity;
    float cellHeight = cellWidth * aspectRatio; // Square cells in screen space
    
    // Find which cell this pixel belongs to
    vec2 cellId = floor(uv / vec2(cellWidth, cellHeight));
    
    // Get cell center UV for sampling the gradient luminosity
    vec2 cellCenter = (cellId + 0.5) * vec2(cellWidth, cellHeight);
    
    // Calculate position within the cell (-0.5 to 0.5)
    vec2 cellUV = fract(uv / vec2(cellWidth, cellHeight)) - 0.5;
    
    // Get luminosity at this pixel (ideally would sample at cell center)
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    
    // Apply invert if enabled
    if (u_dotMatrixInvert) {
        luma = 1.0 - luma;
    }
    
    // Clamp luminosity
    luma = clamp(luma, 0.0, 1.0);
    
    // Calculate dot size based on luminosity
    // Light areas = big dots (when not inverted)
    float dotSize = mix(u_dotMatrixSizeMin, u_dotMatrixSizeMax, luma);

    // Apply gap: gap shrinks the maximum dot size uniformly
    // Gap 0 = dots can fill entire cell (touch each other)
    // Gap 1 = dots shrink to 20% of cell (lots of background visible)
    float gapScale = 1.0 - (u_dotMatrixGap * 0.8);
    dotSize *= gapScale;

    // Convert to radius (0-0.5 range within cell)
    float radius = dotSize * 0.5;
    
    // Calculate distance from cell center using the shape function
    float dist = dotMatrixShapeDistance(cellUV, u_dotMatrixShape);
    
    // Calculate edge with softness
    // Softness 0 = hard edge, Softness 1 = very soft/glowing
    float edge = mix(0.001, 0.15, u_dotMatrixSoftness);
    
    // Dot mask: 1.0 inside dot, 0.0 outside
    float dotMask = smoothstep(radius + edge, radius - edge, dist);
    
    // Determine dot color based on color mode
    vec3 dotColor;
    if (u_dotMatrixColorMode == 0) {
        // Colored: use gradient color
        dotColor = color;
    } else if (u_dotMatrixColorMode == 1) {
        // Mono: use single color
        dotColor = u_dotMatrixMonoColor;
    } else {
        // Duotone: interpolate between two colors based on luminosity
        dotColor = mix(u_dotMatrixDuoDark, u_dotMatrixDuoLight, luma);
    }
    
    // Composite: background in gaps, dot color where there's a dot
    vec3 result = mix(u_dotMatrixBackground, dotColor, dotMask);
    
    return result;
}
`

export const dotMatrixUtils = dotMatrixUniforms + dotMatrixFunctions

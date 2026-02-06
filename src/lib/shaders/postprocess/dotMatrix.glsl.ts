/**
 * Dot Matrix Post-Processing Shader
 * 
 * Two-pass approach: Renders the gradient to a texture first,
 * then this shader samples that texture at CELL CENTERS to get
 * uniform luminosity for each cell, producing perfect circles.
 */

export const dotMatrixVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const dotMatrixFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D tDiffuse;          // Source gradient texture
uniform vec2 u_resolution;           // Screen resolution
uniform float u_density;             // Dots per row (10-150)
uniform int u_shape;                 // 0 = circle, 1 = square, 2 = diamond
uniform float u_sizeMin;             // Min dot size (0-1)
uniform float u_sizeMax;             // Max dot size (0-1)
uniform int u_colorMode;             // 0 = colored, 1 = mono, 2 = duotone
uniform vec3 u_monoColor;            // Mono color
uniform vec3 u_duoDark;              // Duotone dark
uniform vec3 u_duoLight;             // Duotone light
uniform vec3 u_background;           // Background color
uniform float u_softness;            // Edge softness (0-1)
uniform bool u_invert;               // Invert luminosity
uniform float u_gap;                 // Gap between dots (0-1)
uniform float u_time;                // For texture animation

// Perspective uniforms
uniform bool u_perspectiveEnabled;
uniform float u_perspectiveTiltX;    // -60 to 60
uniform float u_perspectiveTiltY;    // -60 to 60

varying vec2 vUv;

/**
 * Apply perspective transformation to UV
 * Uses a linear depth model that scales smoothly from near to far
 * Near side gets bigger, far side gets smaller - continuous gradient
 */
vec2 perspectiveUV(vec2 uv, float tiltX, float tiltY) {
    float rx = tiltX * 0.0174533;
    float ry = tiltY * 0.0174533;

    vec2 centered = uv - 0.5;

    // Calculate depth: ranges from -0.5 to +0.5 based on position and tilt
    float depth = centered.x * sin(ry) + centered.y * sin(rx);

    // Linear perspective: z = 1 + depth * scale
    // depth negative (near) → z < 1 → dividing makes bigger
    // depth positive (far) → z > 1 → dividing makes smaller
    // Scale factor controls how dramatic the effect is
    float scale = 1.8;
    float z = 1.0 + depth * scale;

    // Clamp z to reasonable range to prevent extreme distortion
    // Near side: z can go down to 0.4 (2.5x enlargement)
    // Far side: z can go up to 2.0 (0.5x size)
    z = clamp(z, 0.4, 2.0);

    vec2 result = centered / z;

    return result + 0.5;
}

// Hash for organic texture
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// SDF for different shapes
float shapeSDF(vec2 p, int shape) {
    if (shape == 0) {
        // Circle
        return length(p);
    } else if (shape == 1) {
        // Square (Chebyshev distance)
        return max(abs(p.x), abs(p.y));
    } else {
        // Diamond (Manhattan distance)
        return abs(p.x) + abs(p.y);
    }
}

void main() {
    // Apply perspective transformation if enabled
    vec2 uv = vUv;
    if (u_perspectiveEnabled) {
        uv = perspectiveUV(vUv, u_perspectiveTiltX, u_perspectiveTiltY);
    }

    // Aspect ratio correction for square cells
    float aspectRatio = u_resolution.x / u_resolution.y;

    // Gap affects the effective density - more gap = smaller cells = more dots
    // Gap 0 = use base density
    // Gap 100 = cells shrink to ~50% → doubles the apparent dot count
    float gapDensityMultiplier = 1.0 + u_gap * 1.0;
    float effectiveDensity = u_density * gapDensityMultiplier;

    // Cell dimensions - cells should be square in screen space
    float cellWidth = 1.0 / effectiveDensity;
    float cellHeight = cellWidth * aspectRatio;
    vec2 cellSize = vec2(cellWidth, cellHeight);

    // ═══════════════════════════════════════════════════════════
    // KEY: Use raw uv for grid, sample texture at cell CENTER
    // ═══════════════════════════════════════════════════════════

    // Which cell are we in? (integer cell ID)
    vec2 cellId = floor(uv / cellSize);

    // Cell CENTER in UV space - this is where we sample the texture
    vec2 cellCenterUV = (cellId + 0.5) * cellSize;

    // Sample texture at cell center - ALL pixels in this cell use this value
    vec4 cellColor = texture2D(tDiffuse, cellCenterUV);
    float luma = dot(cellColor.rgb, vec3(0.299, 0.587, 0.114));

    // Apply invert
    if (u_invert) {
        luma = 1.0 - luma;
    }

    // Position within cell (0-1), then center it (-0.5 to 0.5)
    vec2 cellUV = fract(uv / cellSize);
    vec2 cellPos = cellUV - 0.5;

    // For non-square cells, normalize to square space for shape calculation
    cellPos.y /= aspectRatio;

    // Calculate dot size based on luminosity (uniform across cell!)
    // Size range is 0-1, where 1 means fill the cell (0.5 radius)
    float dotSize = mix(u_sizeMin, u_sizeMax, luma);

    // When gap increases density, dots naturally become smaller (cells are smaller)
    // But the SIZE RATIO within each cell stays the same
    // Dots at sizeMax=100% will still fill their (now smaller) cell
    float radius = dotSize * 0.5;
    
    // Get distance using SDF
    float dist = shapeSDF(cellPos, u_shape);
    
    // Anti-aliased edge
    float edge = mix(0.001, 0.08, u_softness);
    float dotMask = smoothstep(radius + edge, radius - edge, dist);
    
    // Determine dot color
    vec3 dotColor;
    if (u_colorMode == 0) {
        // Colored: use original gradient color from cell center
        dotColor = cellColor.rgb;
    } else if (u_colorMode == 1) {
        // Mono
        dotColor = u_monoColor;
    } else {
        // Duotone: interpolate based on luminosity
        dotColor = mix(u_duoDark, u_duoLight, luma);
    }
    
    // Composite: background in gaps, dot color in dots
    vec3 finalColor = mix(u_background, dotColor, dotMask);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`

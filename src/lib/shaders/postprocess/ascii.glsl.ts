/**
 * ASCII Post-Processing Shader
 *
 * Two-pass approach: Renders the gradient to a texture first,
 * then this shader samples that texture at CELL CENTERS to get
 * uniform luminosity for character selection, producing clean text.
 *
 * Enhanced with: rotation, line height, letter spacing, shadow, glow,
 * perspective, and edge detection modes.
 */

export const asciiVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const asciiFragmentShader = /* glsl */ `
precision highp float;

// Core uniforms
uniform sampler2D tDiffuse;          // Source gradient texture
uniform sampler2D u_asciiAtlas;      // Font atlas (horizontal strip)
uniform vec2 u_resolution;           // Screen resolution
uniform float u_density;             // Characters per row (20-200)
uniform int u_charCount;             // Number of characters in atlas
uniform bool u_colored;              // Use gradient color vs mono
uniform vec3 u_monoColor;            // Mono character color
uniform vec3 u_background;           // Background color
uniform bool u_invert;               // Invert luminosity mapping

// Typography uniforms
uniform float u_rotation;            // Grid rotation in degrees (0-360)
uniform float u_lineHeight;          // Line height multiplier (0.5-2.0)
uniform float u_letterSpacing;       // Letter spacing multiplier (0.5-2.0)

// Shadow uniforms
uniform bool u_shadowEnabled;
uniform vec3 u_shadowColor;
uniform float u_shadowOffsetX;       // -20 to 20
uniform float u_shadowOffsetY;       // -20 to 20
uniform float u_shadowBlur;          // 0-1

// Glow uniforms
uniform bool u_glowEnabled;
uniform float u_glowAmount;          // 0-100
uniform float u_glowRadius;          // 0-1

// Perspective uniforms
uniform bool u_perspectiveEnabled;
uniform float u_perspectiveTiltX;    // -45 to 45
uniform float u_perspectiveTiltY;    // -45 to 45

// Edge detection uniforms
uniform bool u_edgeEnabled;
uniform float u_edgeThreshold;       // 0-1

varying vec2 vUv;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Rotate a 2D point around (0.5, 0.5)
 */
vec2 rotateUV(vec2 uv, float angleDegrees) {
    float angle = angleDegrees * 0.0174533; // degrees to radians
    float s = sin(angle);
    float c = cos(angle);
    vec2 centered = uv - 0.5;
    return vec2(
        centered.x * c - centered.y * s,
        centered.x * s + centered.y * c
    ) + 0.5;
}

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

/**
 * Sample character from atlas with optional blur for glow/shadow
 */
float sampleCharacterBlurred(vec2 atlasUV, float blur, float charWidthInAtlas) {
    if (blur < 0.001) {
        vec4 texel = texture2D(u_asciiAtlas, atlasUV);
        return texel.a > 0.01 ? texel.a : texel.r;
    }

    float alpha = 0.0;
    float total = 0.0;

    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * blur * 0.02;
            vec2 sampleUV = atlasUV + offset;
            float weight = exp(-float(x*x + y*y) / (blur * blur * 4.0 + 0.1));
            vec4 texel = texture2D(u_asciiAtlas, sampleUV);
            float a = texel.a > 0.01 ? texel.a : texel.r;
            alpha += a * weight;
            total += weight;
        }
    }

    return alpha / total;
}

/**
 * Sobel edge detection using dFdx/dFdy
 */
float detectEdge(vec3 color, float threshold) {
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    float edge = abs(dFdx(luma)) + abs(dFdy(luma));
    edge *= 10.0;
    return smoothstep(threshold * 0.1, threshold * 0.1 + 0.1, edge);
}

void main() {
    if (u_charCount < 1) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
    }

    // Start with working UV
    vec2 workingUV = vUv;

    // Apply perspective if enabled
    if (u_perspectiveEnabled) {
        workingUV = perspectiveUV(workingUV, u_perspectiveTiltX, u_perspectiveTiltY);
    }

    // Apply rotation if set
    if (abs(u_rotation) > 0.1) {
        workingUV = rotateUV(workingUV, u_rotation);
    }

    // Aspect ratio for proper character proportions
    float aspectRatio = u_resolution.x / u_resolution.y;

    // Cell dimensions with spacing adjustments
    // Ensure spacing values are valid (prevent division by zero or negative sizes)
    float baseWidth = 1.0 / max(u_density, 1.0);
    float letterSpacing = max(u_letterSpacing, 0.1);
    float lineHeight = max(u_lineHeight, 0.1);
    float cellWidth = baseWidth * letterSpacing;
    float cellHeight = baseWidth * aspectRatio * 1.5 * lineHeight;
    vec2 cellSize = vec2(cellWidth, cellHeight);

    // Which cell are we in?
    vec2 cellId = floor(workingUV / cellSize);

    // Cell CENTER in UV space
    vec2 cellCenterUV = (cellId + 0.5) * cellSize;

    // For rotated/perspective UVs, we need to sample the original texture correctly
    // Transform cell center back to original UV space for texture sampling
    vec2 sampleUV = cellCenterUV;
    if (abs(u_rotation) > 0.1) {
        sampleUV = rotateUV(sampleUV, -u_rotation);
    }
    if (u_perspectiveEnabled) {
        // Approximate inverse perspective
        sampleUV = perspectiveUV(sampleUV, -u_perspectiveTiltX, -u_perspectiveTiltY);
    }

    // Sample texture at cell center
    vec4 cellColor = texture2D(tDiffuse, clamp(sampleUV, 0.0, 1.0));
    float luma = dot(cellColor.rgb, vec3(0.299, 0.587, 0.114));

    // Edge detection mode
    if (u_edgeEnabled) {
        float edgeStrength = detectEdge(cellColor.rgb, u_edgeThreshold);
        luma *= edgeStrength;
    }

    // Apply invert
    if (u_invert) {
        luma = 1.0 - luma;
    }

    // Clamp to valid range
    luma = clamp(luma, 0.0, 0.9999);

    // Select character based on luminosity
    int charIndex = int(luma * float(u_charCount));
    charIndex = min(charIndex, u_charCount - 1);

    // Position within cell (0-1)
    vec2 cellUV = fract(workingUV / cellSize);

    // Atlas coordinates
    float charWidthInAtlas = 1.0 / float(u_charCount);
    float atlasU = (float(charIndex) + cellUV.x) * charWidthInAtlas;
    float atlasV = 1.0 - cellUV.y; // Flip Y for correct orientation
    vec2 atlasUV = vec2(atlasU, atlasV);

    // Start with background
    vec3 result = u_background;

    // Determine character color
    vec3 charColor = u_colored ? cellColor.rgb : u_monoColor;

    // Apply shadow first (behind character)
    if (u_shadowEnabled) {
        vec2 shadowOffset = vec2(
            u_shadowOffsetX * 0.001 / charWidthInAtlas,
            -u_shadowOffsetY * 0.001
        );
        vec2 shadowUV = atlasUV - shadowOffset;
        float shadowAlpha = sampleCharacterBlurred(shadowUV, u_shadowBlur, charWidthInAtlas);
        result = mix(result, u_shadowColor, shadowAlpha * 0.7);
    }

    // Apply glow (behind character, colored)
    if (u_glowEnabled && u_glowAmount > 0.0) {
        float glowAlpha = sampleCharacterBlurred(atlasUV, u_glowRadius, charWidthInAtlas);
        float glowIntensity = u_glowAmount * 0.01;
        vec3 glowColor = charColor * 1.5;
        result = mix(result, glowColor, glowAlpha * glowIntensity);
    }

    // Sample and apply the main character
    vec4 charSample = texture2D(u_asciiAtlas, atlasUV);
    float charAlpha = charSample.a > 0.01 ? charSample.a : charSample.r;
    result = mix(result, charColor, charAlpha);

    // In edge mode with low edge strength, fade to background
    if (u_edgeEnabled) {
        float edgeStrength = detectEdge(cellColor.rgb, u_edgeThreshold);
        if (edgeStrength < 0.1) {
            result = mix(u_background, result, edgeStrength * 10.0);
        }
    }

    gl_FragColor = vec4(result, 1.0);
}
`

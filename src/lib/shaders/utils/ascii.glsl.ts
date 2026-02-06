/**
 * ASCII Effect Shader
 * 
 * Transforms gradients into text-based art where character density represents brightness.
 * Uses a texture atlas containing pre-rendered characters from JetBrains Mono.
 * 
 * Pipeline position: After Pixelate, before Dot Matrix
 */

export const asciiUniforms = /* glsl */ `
// ASCII Effect - Core
uniform bool u_asciiEnabled;
uniform sampler2D u_asciiAtlas;
uniform float u_asciiDensity;        // 20-200 (characters per row)
uniform int u_asciiCharCount;        // Number of characters in the set
uniform bool u_asciiColored;         // true = sample gradient color, false = mono
uniform vec3 u_asciiMonoColor;       // Mono color when not colored
uniform vec3 u_asciiBackground;      // Background color between/behind characters
uniform bool u_asciiInvert;          // Flip character density mapping

// ASCII Effect - Enhanced
uniform float u_asciiRotation;       // 0-360 (grid rotation in degrees)
uniform float u_asciiLineHeight;     // 0.5-2.0 (vertical spacing multiplier)
uniform float u_asciiLetterSpacing;  // 0.5-2.0 (horizontal spacing multiplier)

// ASCII Effect - Shadow/Depth
uniform bool u_asciiShadowEnabled;
uniform vec3 u_asciiShadowColor;     // Shadow color
uniform float u_asciiShadowOffsetX;  // -20 to 20 (pixels)
uniform float u_asciiShadowOffsetY;  // -20 to 20 (pixels)
uniform float u_asciiShadowBlur;     // 0-1 (blur amount)

// ASCII Effect - Glow
uniform bool u_asciiGlowEnabled;
uniform float u_asciiGlowAmount;     // 0-100 (glow intensity)
uniform float u_asciiGlowRadius;     // 0-1 (glow spread)

// ASCII Effect - Edge Detection
uniform bool u_asciiEdgeMode;        // Only show characters on edges
uniform float u_asciiEdgeThreshold;  // 0-1 (edge sensitivity)

// ASCII Effect - Perspective
uniform bool u_asciiPerspective;     // Enable perspective tilt
uniform float u_asciiPerspectiveX;   // -45 to 45 (X-axis tilt)
uniform float u_asciiPerspectiveY;   // -45 to 45 (Y-axis tilt)
`

export const asciiFunctions = /* glsl */ `
// ============================================
// ASCII EFFECT
// ============================================

/**
 * Rotate a 2D point around origin
 */
vec2 rotateUV(vec2 uv, float angle) {
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
 */
vec2 perspectiveUV(vec2 uv, float tiltX, float tiltY) {
    // Convert angles to radians and scale down for subtle effect
    float rx = tiltX * 0.0174533 * 0.5; // degrees to radians * 0.5
    float ry = tiltY * 0.0174533 * 0.5;

    // Center the UV
    vec2 centered = uv - 0.5;

    // Apply perspective-like distortion
    float z = 1.0 + centered.x * sin(ry) + centered.y * sin(rx);
    z = max(z, 0.1); // Prevent division by zero

    vec2 result = centered / z;

    // Scale to maintain approximate coverage
    result *= 1.0 + abs(sin(rx)) * 0.5 + abs(sin(ry)) * 0.5;

    return result + 0.5;
}

/**
 * Sobel edge detection
 * Returns edge strength 0-1
 */
float detectEdge(vec3 color, vec2 uv, float threshold, float cellWidth, float cellHeight) {
    // Sample neighboring pixels
    vec2 offset = vec2(cellWidth, cellHeight) * 0.5;

    // We use luminance differences as a proxy for edges
    // In a full implementation, we'd sample the actual gradient texture
    float luma = dot(color, vec3(0.299, 0.587, 0.114));

    // Approximate edge detection using luminance gradient
    // This is simplified since we can't sample neighbors directly
    // The edge effect works best with high-contrast gradients
    float edge = abs(dFdx(luma)) + abs(dFdy(luma));
    edge *= 10.0; // Amplify the edge signal

    return smoothstep(threshold * 0.1, threshold * 0.1 + 0.1, edge);
}

/**
 * Sample character from atlas with optional blur for glow/shadow
 */
float sampleCharacter(vec2 atlasUV, float blur) {
    if (blur < 0.001) {
        return texture2D(u_asciiAtlas, atlasUV).a;
    }

    // Multi-sample blur for glow effect
    float alpha = 0.0;
    float total = 0.0;
    float charWidth = 1.0 / float(u_asciiCharCount);

    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            vec2 offset = vec2(float(x), float(y)) * blur * 0.02;
            // Clamp U to stay within current character cell
            vec2 sampleUV = atlasUV + offset;
            float weight = exp(-float(x*x + y*y) / (blur * blur * 4.0 + 0.1));
            alpha += texture2D(u_asciiAtlas, sampleUV).a * weight;
            total += weight;
        }
    }

    return alpha / total;
}

/**
 * Apply ASCII effect to the color
 *
 * @param color The input color from the gradient
 * @param uv The UV coordinates (0-1)
 * @param aspectRatio Canvas width/height ratio
 * @return The color with ASCII effect applied
 */
vec3 applyAscii(vec3 color, vec2 uv, float aspectRatio) {
    if (!u_asciiEnabled || u_asciiCharCount < 1) {
        return color;
    }

    // Apply perspective transformation if enabled
    vec2 workingUV = uv;
    if (u_asciiPerspective) {
        workingUV = perspectiveUV(uv, u_asciiPerspectiveX, u_asciiPerspectiveY);
    }

    // Apply rotation if set
    if (abs(u_asciiRotation) > 0.1) {
        workingUV = rotateUV(workingUV, u_asciiRotation * 0.0174533); // degrees to radians
    }

    // Calculate cell size with spacing adjustments
    float baseWidth = 1.0 / u_asciiDensity;
    float cellWidth = baseWidth * u_asciiLetterSpacing;
    float cellHeight = baseWidth * aspectRatio * 1.5 * u_asciiLineHeight;

    // Find which cell this pixel belongs to
    vec2 cellId = floor(workingUV / vec2(cellWidth, cellHeight));

    // Get cell center UV for sampling the gradient
    vec2 cellCenter = (cellId + 0.5) * vec2(cellWidth, cellHeight);

    // Calculate UV within the cell (0-1)
    vec2 cellUV = fract(workingUV / vec2(cellWidth, cellHeight));

    // Get luminosity
    float luma = dot(color, vec3(0.299, 0.587, 0.114));

    // Edge detection mode - modulate luminosity by edge strength
    if (u_asciiEdgeMode) {
        float edgeStrength = detectEdge(color, uv, u_asciiEdgeThreshold, cellWidth, cellHeight);
        // In edge mode, only show characters where there are edges
        luma *= edgeStrength;
    }

    // Apply invert if enabled
    if (u_asciiInvert) {
        luma = 1.0 - luma;
    }

    // Clamp luminosity to valid range
    luma = clamp(luma, 0.0, 0.9999);

    // Calculate which character to use (0 to charCount-1)
    int charIndex = int(luma * float(u_asciiCharCount));
    charIndex = clamp(charIndex, 0, u_asciiCharCount - 1);

    // Sample the character from the atlas
    float charWidth = 1.0 / float(u_asciiCharCount);
    float atlasU = (float(charIndex) + cellUV.x) * charWidth;
    float atlasV = 1.0 - cellUV.y; // Flip V coordinate
    vec2 atlasUV = vec2(atlasU, atlasV);

    // Start with background
    vec3 result = u_asciiBackground;

    // Determine the character color
    vec3 charColor = u_asciiColored ? color : u_asciiMonoColor;

    // Apply shadow first (behind character)
    if (u_asciiShadowEnabled) {
        // Calculate shadow offset in atlas space
        vec2 shadowOffset = vec2(
            u_asciiShadowOffsetX * 0.001 / charWidth,
            -u_asciiShadowOffsetY * 0.001 // Negative because V is flipped
        );
        vec2 shadowUV = atlasUV - shadowOffset;

        float shadowAlpha = sampleCharacter(shadowUV, u_asciiShadowBlur);
        result = mix(result, u_asciiShadowColor, shadowAlpha * 0.7);
    }

    // Apply glow (behind character, colored)
    if (u_asciiGlowEnabled && u_asciiGlowAmount > 0.0) {
        float glowAlpha = sampleCharacter(atlasUV, u_asciiGlowRadius);
        float glowIntensity = u_asciiGlowAmount * 0.01;

        // Glow color is a brighter version of the character color
        vec3 glowColor = charColor * 1.5;
        result = mix(result, glowColor, glowAlpha * glowIntensity);
    }

    // Sample and apply the main character
    float charAlpha = texture2D(u_asciiAtlas, atlasUV).a;
    result = mix(result, charColor, charAlpha);

    // In edge mode with low edge strength, fade to background
    if (u_asciiEdgeMode) {
        float edgeStrength = detectEdge(color, uv, u_asciiEdgeThreshold, cellWidth, cellHeight);
        // Fade out areas with no edges
        if (edgeStrength < 0.1) {
            result = mix(u_asciiBackground, result, edgeStrength * 10.0);
        }
    }

    return result;
}
`

export const asciiUtils = asciiUniforms + asciiFunctions

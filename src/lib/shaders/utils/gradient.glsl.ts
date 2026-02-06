/**
 * Gradient Color Sampling
 * 
 * Core function to sample colors from a gradient with blend options
 */

import { colorUtils } from './color.glsl'
import { easingUtils } from './easing.glsl'

export const gradientUtils = /* glsl */ `
${colorUtils}
${easingUtils}

// Blend uniforms
uniform int blendHardStops;
uniform float blendSteps;
uniform int blendEasing;
uniform int blendColorMode; // 0=linear RGB, 1=HSV short path, 2=HSV long path

// Gradient animation uniforms
uniform float u_gradientOffset;  // Shifts colors along gradient (-1 to 1)
uniform float u_gradientScale;   // Compresses/expands gradient (0.5 to 2)
uniform float u_colorSpread;     // How spread out colors are (0.5 to 1.5)
uniform float u_colorCycle;      // -1 to 1: shifts all color stops (wrapping)
uniform float u_gradientCenterX; // 0 to 100: gradient origin X (for radial/conic)
uniform float u_gradientCenterY; // 0 to 100: gradient origin Y (for radial/conic)
uniform float u_innerRadius;     // 0 to 100: inner radius for radial
uniform float u_outerRadius;     // 50 to 200: outer radius for radial
uniform float u_conicOffset;     // 0 to 360: additional rotation for conic

// Apply color transformations to gradient position
float applyColorTransforms(float t) {
    // Only apply transforms if they're non-default (optimization + avoids edge artifacts)
    // Scale: compress/expand around center (default = 1.0)
    if (abs(u_gradientScale - 1.0) > 0.001) {
        t = (t - 0.5) * u_gradientScale + 0.5;
    }
    // Offset: shift the gradient (default = 0.0)
    if (abs(u_gradientOffset) > 0.001) {
        t = t + u_gradientOffset;
    }
    // Color spread: affects how spread out the colors are (default = 1.0)
    if (abs(u_colorSpread - 1.0) > 0.001) {
        t = (t - 0.5) * u_colorSpread + 0.5;
    }
    // Color cycle: additional shift for animation (default = 0.0)
    if (abs(u_colorCycle) > 0.001) {
        t = t + u_colorCycle;
        // Only wrap when cycling to create seamless loops
        t = fract(t);
    }
    return t;
}

// Get color from gradient at position t (0-1)
vec3 getGradientColor(float t) {
    // Apply gradient animation transforms
    t = applyColorTransforms(t);
    
    t = clamp(t, 0.0, 1.0);
    
    // Posterize/stepped over full gradient when steps > 1
    float steps = max(blendSteps, 0.0);
    if (steps >= 2.0) {
        t = floor(t * steps) / steps;
    }
    
    // Handle edge cases
    if (t <= colorPositions[0]) return colorStops[0];
    if (t >= colorPositions[numStops - 1]) return colorStops[numStops - 1];
    
    // Find the two stops that t falls between
    for (int i = 0; i < 9; i++) {
        if (i + 1 >= numStops) break;
        
        if (t >= colorPositions[i] && t <= colorPositions[i + 1]) {
            float range = max(colorPositions[i + 1] - colorPositions[i], 0.0001);
            float localT = (t - colorPositions[i]) / range;
            
            // Apply hard stops or easing
            if (blendHardStops == 1) {
                localT = step(0.5, localT);
            } else {
                localT = applyEasing(localT, blendEasing);
            }
            
            vec3 c1 = colorStops[i];
            vec3 c2 = colorStops[i + 1];
            
            // Color interpolation modes:
            // 0 = linear RGB (perceptually correct, no hue shift)
            // 1 = HSV short path (classic behavior, takes shortest hue route)
            // 2 = HSV long path (wraps around color wheel the long way)
            if (blendColorMode == 1) {
                return hueMix(c1, c2, localT, 0); // HSV short path
            } else if (blendColorMode == 2) {
                return hueMix(c1, c2, localT, 1); // HSV long path
            }

            // Default (0): linear space mixing (standard gradient behavior)
            return mixLinear(c1, c2, localT);
        }
    }
    
    return colorStops[0];
}
`



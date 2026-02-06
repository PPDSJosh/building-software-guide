/**
 * Lava Lamp - Organic Flowing Warp Effect
 * 
 * Creates organic flowing distortion across the entire gradient.
 * Multiple influence points (blobs) push and pull the UV coordinates,
 * making the gradient appear to flow like liquid being pushed by rising bubbles.
 * 
 * KEY CONCEPT: This is a WARP effect, not a mask.
 * - The entire canvas is always filled with gradient
 * - Blobs create distortion/displacement, not visibility
 * - Colors stretch and flow but never disappear
 */

// GLSL uniforms for lava lamp warp effect
export const lavaLampUniforms = /* glsl */ `
// Lava Lamp - Organic Warp Influence
uniform bool u_lavaLampEnabled;
uniform float u_lavaLampIntensity;   // Overall distortion strength (0-1)
uniform int u_lavaLampBlobCount;     // Number of active blobs (2-6)
uniform vec2 u_lavaLampPositions[6]; // Position of each blob (0-1 UV space)
uniform float u_lavaLampSizes[6];    // Influence radius of each blob
uniform float u_lavaLampTime;        // Animation time for organic pulsing
`

// GLSL functions for lava lamp warp effect
export const lavaLampFunctions = /* glsl */ `
// ============================================
// LAVA LAMP - ORGANIC FLOWING WARP
// ============================================

// Apply lava lamp warp to UV coordinates
// This creates organic flowing distortion - like the gradient is liquid
// being pushed around by invisible rising bubbles
vec2 applyLavaLampWarp(vec2 uv) {
    if (!u_lavaLampEnabled || u_lavaLampIntensity < 0.01) return uv;
    
    vec2 totalOffset = vec2(0.0);
    
    for (int i = 0; i < 6; i++) {
        if (i >= u_lavaLampBlobCount) break;
        
        vec2 blobPos = u_lavaLampPositions[i];
        float blobSize = u_lavaLampSizes[i];
        
        // Distance from this blob's center
        vec2 delta = uv - blobPos;
        float dist = length(delta);
        
        // Influence falls off smoothly with distance
        // Using smoothstep for soft organic edges
        float influence = 1.0 - smoothstep(0.0, blobSize, dist);
        influence = influence * influence; // Quadratic falloff for even softer edges
        
        // Direction of push: away from blob center (bulge effect)
        vec2 pushDir = normalize(delta + vec2(0.001)); // Small offset prevents zero vector
        
        // Organic variation: each blob pulses slightly differently
        float blobPhase = float(i) * 1.618; // Golden ratio for nice distribution
        float organicPulse = sin(u_lavaLampTime * 0.5 + blobPhase) * 0.3 + 0.7;
        
        // Calculate push strength
        // Positive = pushes away from center (convex bulge)
        float pushStrength = blobSize * 0.4 * u_lavaLampIntensity * organicPulse;
        vec2 offset = pushDir * influence * pushStrength;
        
        // Add subtle swirl component for more organic feel
        float swirlAmount = sin(u_lavaLampTime * 0.3 + blobPhase * 2.0) * 0.15 * u_lavaLampIntensity;
        vec2 swirl = vec2(-delta.y, delta.x) * influence * swirlAmount;
        
        totalOffset += offset + swirl;
    }
    
    // Subtract offset to create the bulge effect
    // (pulling UV toward blob centers makes colors push outward visually)
    return uv - totalOffset;
}
`

// Combined export for easy import
export const lavaLampUtils = lavaLampUniforms + lavaLampFunctions













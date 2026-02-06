/**
 * Warp Utilities - UV Distortion Functions
 * 
 * Each warp has a clear identity:
 * - Bend: "The Curve" - Curves like wrapping around a cylinder
 * - Twist: "The Spiral" - Rotates around a center point
 * - Wave: "The Undulation" - Rhythmic sinusoidal flow
 * - Sphere: "The Lens" - Fisheye/barrel distortion
 * - Bulge: "The Push/Pull" - Expands or contracts from a point
 * - Ripple: "The Stone in Water" - Concentric waves from a point
 */

// GLSL uniforms for warp effects
export const warpUniforms = /* glsl */ `
uniform float u_bendAmount;
uniform float u_bendAxis;
uniform float u_bendPinch;

uniform float u_twistAmount;
uniform float u_twistRadius;
uniform vec2 u_twistCenter;

uniform float u_sphereAmount;
uniform float u_sphereRadius;
uniform vec2 u_sphereCenter;

uniform float u_waveAmplitude;
uniform float u_waveFrequency;
uniform int u_waveDirection;
uniform float u_waveRotation;

uniform float u_bulgeAmount;
uniform float u_bulgeRadius;
uniform vec2 u_bulgeCenter;

uniform float u_rippleAmplitude;
uniform float u_rippleFrequency;
uniform vec2 u_rippleCenter;
uniform float u_rippleDecay;
uniform float u_rippleRotation;

uniform float u_blurAmount;
`

// GLSL functions for UV distortion
export const warpFunctions = /* glsl */ `
// ============================================
// BEND - "The Curve"
// Curves gradient like wrapping around a cylinder
// Key: Singular directional curve with pinch for perspective
// ============================================
vec2 applyBendWarp(vec2 uv, float amount, float axis, float pinch) {
    if (abs(amount) < 0.001) return uv;
    
    // Rotate to align with axis
    float rad = axis * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    vec2 centered = uv - 0.5;
    vec2 rotated = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
    
    // Bend curve - sine wave creates cylindrical wrap effect
    float bendFactor = amount * 0.015;
    float curve = sin(rotated.x * 3.14159) * bendFactor;
    rotated.y += curve;
    
    // PINCH: Compress perpendicular axis at the edges
    // Creates perspective effect - edges get narrower
    float edgeDist = abs(rotated.x) * 2.0; // 0 at center, 1 at edges
    float pinchFactor = 1.0 - (pinch * 0.01 * edgeDist * edgeDist);
    pinchFactor = max(pinchFactor, 0.1); // Don't collapse completely
    rotated.y *= pinchFactor;
    
    // Rotate back
    vec2 unrotated = vec2(rotated.x * c + rotated.y * s, -rotated.x * s + rotated.y * c);
    return unrotated + 0.5;
}

// ============================================
// TWIST - "The Spiral"
// Rotates around a center point
// Key difference from Bend: Rotation based on distance from CENTER
// ============================================
vec2 applyTwistWarp(vec2 uv, float amount, float radius, vec2 center) {
    if (abs(amount) < 0.001) return uv;
    
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    
    // Smooth falloff from center - quadratic for smoother edge
    float falloff = 1.0 - smoothstep(0.0, radius, dist);
    falloff = falloff * falloff;
    
    // Rotation angle - MORE rotation near center, LESS at edges
    float angle = amount * 3.14159 / 180.0 * falloff;
    
    // Apply rotation
    float c = cos(angle), s = sin(angle);
    vec2 twisted = vec2(
        toCenter.x * c - toCenter.y * s,
        toCenter.x * s + toCenter.y * c
    );
    
    return twisted + center;
}

// ============================================
// SPHERE - "The Lens"
// Fisheye/barrel distortion
// Positive = barrel (magnify center), Negative = pincushion
// ============================================
vec2 applySphereWarp(vec2 uv, float amount, float radius, vec2 center) {
    if (abs(amount) < 0.001) return uv;
    
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    
    if (dist < 0.001) return uv;
    if (dist > radius) return uv; // Only affect area within radius
    
    // Normalize distance within radius
    float normDist = dist / radius;
    
    // Fisheye distortion formula
    float power = 1.0 + abs(amount) * 0.02;
    float newDist;
    
    if (amount > 0.0) {
        // Barrel distortion - magnify center (push outward)
        newDist = pow(normDist, power) * radius;
    } else {
        // Pincushion distortion - shrink center (pull inward)
        newDist = pow(normDist, 1.0 / power) * radius;
    }
    
    // Apply new distance
    vec2 dir = toCenter / dist;
    return center + dir * newDist;
}

// ============================================
// WAVE - "The Undulation"
// Rhythmic sinusoidal flow with rotation
// ============================================
vec2 applyWaveWarp(vec2 uv, float amplitude, float frequency, int direction, float rotation) {
    if (amplitude < 0.001) return uv;
    
    // Apply rotation to UV space
    float rad = rotation * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    vec2 centered = uv - 0.5;
    vec2 rotatedUV = vec2(
        centered.x * c - centered.y * s,
        centered.x * s + centered.y * c
    ) + 0.5;
    
    float amt = amplitude * 0.005;
    float freq = frequency * 2.0;
    
    vec2 displacement = vec2(0.0);
    
    if (direction == 0) { // Horizontal
        displacement.x = sin(rotatedUV.y * freq * 6.28318) * amt;
    } else if (direction == 1) { // Vertical
        displacement.y = sin(rotatedUV.x * freq * 6.28318) * amt;
    } else { // Diagonal
        float wave = sin((rotatedUV.x + rotatedUV.y) * freq * 4.44) * amt;
        displacement = vec2(wave, wave);
    }
    
    // Rotate displacement back
    vec2 rotatedDisp = vec2(
        displacement.x * c + displacement.y * s,
        -displacement.x * s + displacement.y * c
    );
    
    return uv + rotatedDisp;
}

// ============================================
// BULGE - "The Push/Pull" (Fisheye/Anti-Fisheye)
// Positive = Bulge outward (magnify center, fisheye)
// Negative = Pull inward (shrink center, anti-fisheye)
// ============================================
vec2 applyBulgeWarp(vec2 uv, float amount, float radius, vec2 center) {
    if (abs(amount) < 0.001) return uv;
    
    // Vector from center to current point
    vec2 delta = uv - center;
    float dist = length(delta);
    
    if (dist < 0.001) return uv;
    
    // Normalize radius to usable range (0.1-2.0)
    float r = max(radius, 0.1);
    
    // Calculate normalized distance from center (0-1 within radius)
    float factor = dist / r;
    
    if (factor >= 1.0) return uv; // Outside radius, no effect
    
    // Amount: -100 to 100, normalize to useful range
    float amt = amount * 0.01; // -1 to 1
    
    // Strength is strongest at center, falls off toward radius edge
    float strength = 1.0 - factor * factor; // Quadratic falloff
    
    // Calculate displacement
    float displacement = amt * strength * 0.5;
    
    // For POSITIVE amount: push outward (bulge/fisheye - magnify center)
    // UV moves TOWARD center, so we sample from outside -> creates magnification
    // For NEGATIVE amount: pull inward (anti-fisheye - shrink center)
    // UV moves AWAY from center, so we sample from inside -> creates shrink
    
    float scaleFactor;
    if (amt > 0.0) {
        // Bulge: magnify center by pulling UVs inward
        scaleFactor = 1.0 - displacement;
    } else {
        // Pinch: shrink center by pushing UVs outward
        scaleFactor = 1.0 - displacement; // displacement is negative, so this adds
    }
    
    // Clamp to prevent inversion
    scaleFactor = max(scaleFactor, 0.1);
    
    return center + delta * scaleFactor;
}

// ============================================
// RIPPLE - "The Stone in Water"
// Concentric waves from a point with optional rotation
// Decay: 0 = ripples extend to edges, 50 = fade halfway, 100 = near center only
// ============================================
vec2 applyRippleWarp(vec2 uv, float amplitude, float frequency, vec2 center, float decay, float rotation) {
    if (amplitude < 0.001) return uv;
    
    // Apply rotation to the coordinate space (tilts ripple plane)
    float rad = rotation * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    
    vec2 toCenter = uv - center;
    
    // Rotate the vector to center
    vec2 rotatedToCenter = vec2(
        toCenter.x * c - toCenter.y * s,
        toCenter.x * s + toCenter.y * c
    );
    
    // Use rotated distance for wave calculation
    float dist = length(rotatedToCenter);
    
    if (dist < 0.001) return uv;
    
    // Concentric waves
    float wave = sin(dist * frequency * 20.0) * amplitude * 0.004;
    
    // Gentler decay curve: 0-100 becomes 0-1, then very soft exponential falloff
    // At decay 0, ripples go edge to edge
    // At decay 50, they fade about halfway
    // At decay 100, concentrated near center
    float decayNormalized = decay * 0.01; // 0-100 becomes 0-1
    wave *= exp(-dist * decayNormalized * 2.0); // Much gentler than before (was 3.0)
    
    // Displace radially (in original coordinate space)
    vec2 dir = normalize(toCenter);
    return uv + dir * wave;
}

// ============================================
// APPLY ALL WARPS - Call this in fragment shader
// ============================================
vec2 applyAllWarps(vec2 uv) {
    vec2 result = uv;

    // Apply warps in sequence - order matters for combined effects
    result = applyBendWarp(result, u_bendAmount, u_bendAxis, u_bendPinch);
    result = applyTwistWarp(result, u_twistAmount, u_twistRadius, u_twistCenter);
    result = applySphereWarp(result, u_sphereAmount, u_sphereRadius, u_sphereCenter);
    result = applyWaveWarp(result, u_waveAmplitude, u_waveFrequency, u_waveDirection, u_waveRotation);
    result = applyBulgeWarp(result, u_bulgeAmount, u_bulgeRadius, u_bulgeCenter);
    result = applyRippleWarp(result, u_rippleAmplitude, u_rippleFrequency, u_rippleCenter, u_rippleDecay, u_rippleRotation);

    return result;
}
`

// Combined export for easy import in fragment shaders
export const warpUtils = warpUniforms + warpFunctions














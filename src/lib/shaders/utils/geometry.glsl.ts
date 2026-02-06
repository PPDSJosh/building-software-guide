/**
 * Geometry Effects - Grid/Column with Mesh Deformation
 * 
 * KEY CONCEPT: Mesh deformation affects the TILE SHAPES themselves.
 * Instead of distorting content inside fixed square tiles, we deform
 * the entire coordinate space so tiles become trapezoids, parallelograms,
 * curved quadrilaterals, etc.
 * 
 * Order: Deform UV → Calculate grid → Sample gradient
 */

// GLSL uniforms for geometry effects
export const geometryUniforms = /* glsl */ `
// Grid Refraction
uniform bool u_gridEnabled;
uniform float u_gridTilesX;
uniform float u_gridTilesY;
uniform float u_gridRefraction;
uniform float u_gridAngle;
uniform float u_gridVariation;
// Grid Mesh Deformation
uniform float u_gridMeshBulge;
uniform float u_gridMeshSkewX;
uniform float u_gridMeshSkewY;
uniform float u_gridMeshPerspective;
uniform float u_gridMeshPerspectiveAngle;
uniform float u_gridMeshCurve;
uniform float u_gridMeshCurveAxis;
uniform float u_gridMeshWave;
uniform float u_gridMeshWaveFreq;
uniform float u_gridMeshWaveAngle;
uniform float u_gridMeshTwist;

// Column Refraction
uniform bool u_columnsEnabled;
uniform float u_columnsCount;
uniform float u_columnsOffset;
uniform float u_columnsAngle;
uniform float u_columnsPerspective;
uniform int u_columnsPattern;
// Column Mesh Deformation
uniform float u_columnsMeshBulge;
uniform float u_columnsMeshSkewX;
uniform float u_columnsMeshSkewY;
uniform float u_columnsMeshCurve;
uniform float u_columnsMeshCurveAxis;
uniform float u_columnsMeshWave;
uniform float u_columnsMeshWaveFreq;
uniform float u_columnsMeshWaveAngle;
uniform float u_columnsMeshTwist;

// 3D Depth
uniform bool u_depthEnabled;
uniform float u_depthAmount;
uniform vec2 u_depthCenter;
uniform float u_depthFalloff;
uniform bool u_depthShading;
uniform int u_depthSurfaceType;
uniform float u_depthSurfaceWave;
uniform float u_depthWaveScale;
`

// GLSL functions for geometry effects
export const geometryFunctions = /* glsl */ `
// ============================================
// MESH DEFORMATION FUNCTIONS
// These deform the entire coordinate space BEFORE grid calculation
// ============================================

// Bulge the entire mesh using proper barrel/pincushion distortion
// Positive amount: bulge outward (center magnifies, convex)
// Negative amount: pinch inward (center shrinks, concave)
vec2 meshBulge(vec2 uv, float amount, vec2 center) {
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    
    if (dist < 0.001 || abs(amount) < 0.001) return uv;
    
    // Normalize to -1 to 1 range for distortion strength
    float k = amount * 0.008;
    
    // Use smooth power-based distortion (no inversions)
    // This is the standard barrel/pincushion formula
    float r2 = dist * dist;
    float r4 = r2 * r2;
    
    // Distortion factor: 1 + k*r^2 + 0.5*k^2*r^4 for smooth falloff
    // Positive k = barrel (bulge out), negative k = pincushion (pinch in)
    float factor = 1.0 + k * r2 + 0.3 * k * k * r4;
    
    // Clamp factor to prevent extreme distortion at edges
    factor = clamp(factor, 0.2, 3.0);
    
    // Apply distortion
    return center + toCenter * factor;
}

// Skew the mesh - squares become parallelograms
vec2 meshSkew(vec2 uv, float skewX, float skewY) {
    if (abs(skewX) < 0.001 && abs(skewY) < 0.001) return uv;
    
    vec2 centered = uv - 0.5;
    
    float sx = skewX * 0.02;
    float sy = skewY * 0.02;
    
    // Skew transformation
    vec2 skewed = vec2(
        centered.x + centered.y * sx,
        centered.y + centered.x * sy
    );
    
    return skewed + 0.5;
}

// Perspective - tiles recede into distance
vec2 meshPerspective(vec2 uv, float amount, float angle) {
    if (abs(amount) < 0.001) return uv;
    
    vec2 centered = uv - 0.5;
    
    // Rotate to align with perspective direction
    float rad = angle * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    vec2 rotated = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
    
    // Perspective: compress one side more than the other
    float perspectiveStrength = amount * 0.01;
    float scale = 1.0 + rotated.y * perspectiveStrength;
    scale = max(scale, 0.1); // Prevent collapse
    
    rotated.x *= scale;
    
    // Rotate back
    vec2 result = vec2(rotated.x * c + rotated.y * s, -rotated.x * s + rotated.y * c);
    
    return result + 0.5;
}

// Cylindrical curve - grid wraps around a cylinder
vec2 meshCurve(vec2 uv, float amount, float axis) {
    if (abs(amount) < 0.001) return uv;
    
    vec2 centered = uv - 0.5;
    
    // Rotate to align with curve axis
    float rad = axis * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    vec2 rotated = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
    
    // Cylindrical projection
    float curveAmount = amount * 0.02;
    float curveInput = rotated.x * 3.14159 * curveAmount;
    
    // Sine gives the wrap-around effect
    float curvedX = curveInput;
    if (abs(curveAmount) > 0.01) {
        curvedX = sin(curveInput) / (3.14159 * curveAmount);
    }
    
    // Depth-based compression (edges are further)
    float depth = cos(rotated.x * 3.14159 * curveAmount * 0.5);
    rotated.y *= mix(1.0, depth, abs(amount) * 0.01);
    
    vec2 curved = vec2(curvedX, rotated.y);
    
    // Rotate back
    vec2 result = vec2(curved.x * c + curved.y * s, -curved.x * s + curved.y * c);
    
    return result + 0.5;
}

// Wave deformation - flag/cloth effect
vec2 meshWave(vec2 uv, float amplitude, float frequency, float angle, float phase) {
    if (amplitude < 0.001) return uv;
    
    float rad = angle * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    vec2 centered = uv - 0.5;
    vec2 rotated = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c);
    
    // Wave displacement perpendicular to wave direction
    float waveInput = rotated.x * frequency * 3.14159 * 2.0 + phase;
    float displacement = sin(waveInput) * amplitude * 0.01;
    
    rotated.y += displacement;
    
    // Compression in wave troughs (3D effect)
    float compression = 1.0 - cos(waveInput) * amplitude * 0.003;
    rotated.x *= compression;
    
    // Rotate back
    vec2 result = vec2(rotated.x * c + rotated.y * s, -rotated.x * s + rotated.y * c);
    
    return result + 0.5;
}

// Twist deformation - spiral the entire mesh
vec2 meshTwist(vec2 uv, float amount, vec2 center) {
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    
    if (dist < 0.001 || abs(amount) < 0.001) return uv;
    
    // Twist angle based on distance from center
    float twistAngle = dist * amount * 0.05;
    
    float c = cos(twistAngle), s = sin(twistAngle);
    vec2 twisted = vec2(
        toCenter.x * c - toCenter.y * s,
        toCenter.x * s + toCenter.y * c
    );
    
    return center + twisted;
}

// ============================================
// APPLY ALL MESH DEFORMATIONS
// ============================================
vec2 applyMeshDeformation(
    vec2 uv,
    float bulge,
    float skewX,
    float skewY,
    float perspective,
    float perspectiveAngle,
    float curve,
    float curveAxis,
    float wave,
    float waveFreq,
    float waveAngle,
    float twist
) {
    vec2 result = uv;
    
    if (abs(bulge) > 0.001) {
        result = meshBulge(result, bulge, vec2(0.5));
    }
    if (abs(skewX) > 0.001 || abs(skewY) > 0.001) {
        result = meshSkew(result, skewX, skewY);
    }
    if (abs(perspective) > 0.001) {
        result = meshPerspective(result, perspective, perspectiveAngle);
    }
    if (abs(curve) > 0.001) {
        result = meshCurve(result, curve, curveAxis);
    }
    if (wave > 0.001) {
        result = meshWave(result, wave, waveFreq, waveAngle, 0.0);
    }
    if (abs(twist) > 0.001) {
        result = meshTwist(result, twist, vec2(0.5));
    }
    
    return result;
}

// ============================================
// GRID REFRACTION with Mesh Deformation
// ============================================
vec2 applyGridRefraction(
    vec2 uv,
    float tilesX, float tilesY,
    float refraction, float angle, float variation,
    float meshBulge, float meshSkewX, float meshSkewY,
    float meshPerspective, float meshPerspectiveAngle,
    float meshCurve, float meshCurveAxis,
    float meshWave, float meshWaveFreq, float meshWaveAngle,
    float meshTwist
) {
    // STEP 1: Apply mesh deformation (affects tile SHAPES)
    vec2 deformedUV = applyMeshDeformation(
        uv,
        meshBulge, meshSkewX, meshSkewY,
        meshPerspective, meshPerspectiveAngle,
        meshCurve, meshCurveAxis,
        meshWave, meshWaveFreq, meshWaveAngle,
        meshTwist
    );
    
    // STEP 2: Rotate for grid angle
    float rad = angle * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    vec2 centered = deformedUV - 0.5;
    vec2 rotatedUV = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c) + 0.5;
    
    // STEP 3: Calculate grid tile
    vec2 tileCount = vec2(tilesX, tilesY);
    vec2 tileIndex = floor(rotatedUV * tileCount);
    vec2 tileUV = fract(rotatedUV * tileCount);
    
    // STEP 4: Per-tile refraction (subtle lens effect within tiles)
    float seed = tileIndex.x * 12.9898 + tileIndex.y * 78.233;
    vec2 tileOffset = vec2(
        fract(sin(seed) * 43758.5453) - 0.5,
        fract(sin(seed * 1.1) * 43758.5453) - 0.5
    ) * variation * 0.01;
    
    vec2 tileCenter = tileUV - 0.5;
    float distFromTileCenter = length(tileCenter);
    float refractionStrength = refraction * 0.01;
    vec2 refractOffset = tileCenter * distFromTileCenter * refractionStrength;
    refractOffset += tileOffset * refractionStrength * 0.5;
    
    // STEP 5: Return deformed UV (so gradient follows mesh)
    return deformedUV + refractOffset;
}

// ============================================
// COLUMN REFRACTION with Mesh Deformation
// ============================================
vec2 applyColumnRefraction(
    vec2 uv,
    float columns, float offset, float angle, float perspective, int pattern,
    float meshBulge, float meshSkewX, float meshSkewY,
    float meshCurve, float meshCurveAxis,
    float meshWave, float meshWaveFreq, float meshWaveAngle,
    float meshTwist
) {
    // STEP 1: Apply mesh deformation
    vec2 deformedUV = applyMeshDeformation(
        uv,
        meshBulge, meshSkewX, meshSkewY,
        0.0, 0.0, // No separate perspective for columns (use existing perspective param)
        meshCurve, meshCurveAxis,
        meshWave, meshWaveFreq, meshWaveAngle,
        meshTwist
    );
    
    // STEP 2: Rotate for column angle
    float rad = angle * 3.14159 / 180.0;
    float c = cos(rad), s = sin(rad);
    vec2 centered = deformedUV - 0.5;
    vec2 rotatedUV = vec2(centered.x * c - centered.y * s, centered.x * s + centered.y * c) + 0.5;
    
    // STEP 3: Calculate which column
    float columnIndex = floor(rotatedUV.x * columns);
    
    // STEP 4: Apply column offset pattern
    float columnOffset = offset * 0.01;
    float patternOffset = 0.0;
    
    if (pattern == 0) { // Alternating
        patternOffset = mod(columnIndex, 2.0) * columnOffset;
    } else if (pattern == 1) { // Progressive
        patternOffset = (columnIndex / columns) * columnOffset;
    } else { // Wave
        patternOffset = sin(columnIndex * 0.5) * columnOffset;
    }
    
    vec2 offsetDir = vec2(-s, c);
    deformedUV += offsetDir * patternOffset;
    
    // STEP 5: Apply perspective compression
    if (perspective > 0.001) {
        float perspectiveAmount = perspective * 0.01;
        float distFromCenter = abs(rotatedUV.x - 0.5) * 2.0;
        float perspectiveScale = 1.0 - distFromCenter * perspectiveAmount * 0.5;
        perspectiveScale = max(perspectiveScale, 0.3);
        
        vec2 toCenter = deformedUV - 0.5;
        deformedUV = 0.5 + toCenter * perspectiveScale;
    }
    
    return deformedUV;
}

// ============================================
// 3D DEPTH - Enhanced with Surface Types
// ============================================
vec2 apply3DDepth(vec2 uv, float amount, vec2 center, float falloff, int surfaceType, float surfaceWave, float waveScale) {
    if (abs(amount) < 0.01) return uv;
    
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    
    if (dist < 0.001) return uv;
    
    float depthAmount = amount * 0.01;
    float falloffNorm = falloff * 0.01;
    float influence = 1.0 - smoothstep(0.0, 1.0, dist / (1.0 - falloffNorm * 0.5));
    influence = pow(influence, 2.0 - falloffNorm);
    
    float displacement = 0.0;
    
    if (surfaceType == 0) { // Sphere
        displacement = depthAmount * influence;
    }
    else if (surfaceType == 1) { // Cylinder
        float cylinderInfluence = 1.0 - smoothstep(0.0, 0.5, abs(toCenter.y));
        displacement = depthAmount * cylinderInfluence;
    }
    else if (surfaceType == 2) { // Saddle
        float saddleInfluence = (toCenter.x * toCenter.x - toCenter.y * toCenter.y) * 2.0;
        displacement = depthAmount * saddleInfluence;
    }
    
    if (surfaceWave > 0.001) {
        float waveAmount = surfaceWave * 0.005;
        float wavePhase = dist * waveScale * 10.0;
        displacement += sin(wavePhase) * waveAmount * influence;
    }
    
    vec2 dir = normalize(toCenter);
    float newDist;
    
    if (amount > 0.0) {
        newDist = dist * (1.0 - displacement * dist);
    } else {
        newDist = dist * (1.0 + abs(displacement) * (1.0 - dist));
    }
    
    return center + dir * max(newDist, 0.0);
}

// 3D Shading
vec3 apply3DShading(vec3 color, vec2 uv, float amount, vec2 center) {
    if (abs(amount) < 0.01) return color;
    
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    
    if (dist < 0.001) return color;
    
    vec2 lightDir = normalize(vec2(-0.5, -0.5));
    float lightAngle = dot(normalize(toCenter), lightDir);
    float shadingStrength = abs(amount) * 0.004;
    float shading = 1.0 + lightAngle * shadingStrength * (1.0 - dist * 0.5);
    
    return color * clamp(shading, 0.7, 1.3);
}

// ============================================
// APPLY ALL GEOMETRY EFFECTS
// ============================================
vec2 applyAllGeometry(vec2 uv) {
    vec2 result = uv;
    
    if (u_gridEnabled) {
        result = applyGridRefraction(
            result,
            u_gridTilesX, u_gridTilesY,
            u_gridRefraction, u_gridAngle, u_gridVariation,
            u_gridMeshBulge, u_gridMeshSkewX, u_gridMeshSkewY,
            u_gridMeshPerspective, u_gridMeshPerspectiveAngle,
            u_gridMeshCurve, u_gridMeshCurveAxis,
            u_gridMeshWave, u_gridMeshWaveFreq, u_gridMeshWaveAngle,
            u_gridMeshTwist
        );
    }
    
    if (u_columnsEnabled) {
        result = applyColumnRefraction(
            result,
            u_columnsCount, u_columnsOffset, u_columnsAngle, u_columnsPerspective, u_columnsPattern,
            u_columnsMeshBulge, u_columnsMeshSkewX, u_columnsMeshSkewY,
            u_columnsMeshCurve, u_columnsMeshCurveAxis,
            u_columnsMeshWave, u_columnsMeshWaveFreq, u_columnsMeshWaveAngle,
            u_columnsMeshTwist
        );
    }
    
    if (u_depthEnabled) {
        result = apply3DDepth(result, u_depthAmount, u_depthCenter, u_depthFalloff, u_depthSurfaceType, u_depthSurfaceWave, u_depthWaveScale);
    }
    
    return result;
}

// No bevel needed - mesh deformation naturally creates 3D appearance
vec3 applyGeometryBevel(vec3 color, vec2 uv) {
    return color;
}
`

// Combined export for easy import in fragment shaders
export const geometryUtils = geometryUniforms + geometryFunctions














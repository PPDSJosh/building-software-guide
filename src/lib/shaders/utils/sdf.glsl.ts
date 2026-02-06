/**
 * Signed Distance Functions (SDF)
 * 
 * 2D shape distance functions for reverb/ring effects
 */

export const sdfUtils = /* glsl */ `
// Circle
float sdCircle(vec2 p) {
    return length(p);
}

// Square (axis-aligned)
float sdSquare(vec2 p) {
    return max(abs(p.x), abs(p.y));
}

// Equilateral triangle
float sdTriangle(vec2 p) {
    p.y -= 0.15;
    float k = sqrt(3.0);
    p.x = abs(p.x) - 0.5;
    p.y = p.y + 0.5 / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -1.0, 0.0);
    return length(p) * sign(p.y) * 0.8 + 0.3;
}

// Hexagon
float sdHexagon(vec2 p) {
    vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    return length(p - vec2(clamp(p.x, -k.z * 0.5, k.z * 0.5), 0.5)) * 1.2 + 0.15;
}

// 5-pointed star
float sdStar(vec2 p) {
    float an = 0.628318530;
    float en = 1.047197551;
    vec2 acs = vec2(cos(an), sin(an));
    vec2 ecs = vec2(cos(en), sin(en));
    float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
    p = length(p) * vec2(cos(bn), abs(sin(bn)));
    p -= 0.4 * acs;
    p += ecs * clamp(-dot(p, ecs), 0.0, 0.4 * acs.y / ecs.y);
    return length(p) * sign(p.x) + 0.4;
}

// Diamond (rotated square)
float sdDiamond(vec2 p) {
    return (abs(p.x) + abs(p.y)) * 0.707106781;
}

// Heart shape - Inigo Quilez SDF converted to center-outward distance
// IQ SDF returns signed distance from boundary (negative inside, 0 on boundary).
// But reverb rings need distance from CENTER (0 at center, increasing outward)
// like sdCircle returns length(p). We offset the SDF so level sets form
// concentric heart-shaped rings radiating outward from the center.
float sdHeart(vec2 p) {
    // Scale to IQ heart coordinate space
    p *= 2.0;
    // Map reverb center (0,0) to interior centroid of IQ heart (~0.6)
    // IQ heart: point at (0,0), lobes up to y≈1, width ≈ ±0.6
    p.y += 0.6;

    p.x = abs(p.x);

    // Inigo Quilez exact heart SDF
    float d;
    if (p.y + p.x > 1.0)
        d = sqrt(dot(p - vec2(0.25, 0.75), p - vec2(0.25, 0.75))) - sqrt(2.0) / 4.0;
    else
        d = sqrt(min(
            dot(p - vec2(0.0, 1.0), p - vec2(0.0, 1.0)),
            dot(p - 0.5 * max(p.x + p.y, 0.0), p - 0.5 * max(p.x + p.y, 0.0))
        )) * sign(p.x - p.y);

    // Convert: SDF at center ≈ -0.4, boundary = 0, outside > 0
    // Offset so center ≈ 0, boundary ≈ 0.35, matching other shapes' range
    return d * 0.8 + 0.35;
}

// Shape selector (0-6) — raw SDF (iso-contours degenerate to circles at distance)
float getShapeDistance(vec2 p, int shape) {
    if (shape == 0) return sdCircle(p);
    if (shape == 1) return sdSquare(p);
    if (shape == 2) return sdTriangle(p);
    if (shape == 3) return sdHexagon(p);
    if (shape == 4) return sdStar(p);
    if (shape == 5) return sdDiamond(p);
    if (shape == 6) return sdHeart(p);
    return sdCircle(p);
}

// Shape-preserving distance for concentric rings.
//
// Raw SDFs degenerate: their iso-contours round off toward circles
// at large distances because the distance field smooths out non-convex
// features. A heart SDF produces a heart-shaped ring near the center
// but circular rings at the edges.
//
// Fix: for each pixel, cast a ray from center in that pixel's direction,
// binary-search for the shape boundary radius, and normalize:
//   dist = length(p) / boundaryRadius(angle)
// This makes EVERY level set an exact scaled copy of the shape.
//
// Circle, square, and diamond already have shape-preserving metrics
// (Euclidean, Chebyshev, and L1 norms), so they skip the search.
float getShapeRingDistance(vec2 p, int shape) {
    // These norms produce perfect iso-contours natively
    if (shape == 0) return sdCircle(p);
    if (shape == 1) return sdSquare(p);
    if (shape == 5) return sdDiamond(p);

    float r = length(p);
    if (r < 0.001) return 0.0;

    vec2 dir = p / r;

    // Binary search: find radius where SDF = 0.5 along this ray direction.
    // 0.5 is our reference threshold — roughly one "ring unit" of distance.
    // 12 iterations gives ~0.0005 precision (2.0 / 2^12).
    float lo = 0.001;
    float hi = 2.0;
    for (int i = 0; i < 12; i++) {
        float mid = (lo + hi) * 0.5;
        if (getShapeDistance(dir * mid, shape) < 0.5) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    float boundaryR = (lo + hi) * 0.5;

    // Normalize so boundary = 0.5 (matching ring spacing of original SDFs)
    return (r / max(boundaryR, 0.001)) * 0.5;
}
`















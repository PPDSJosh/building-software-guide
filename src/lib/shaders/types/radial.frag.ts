/**
 * Radial Gradient Shader
 * Supports multiple shape variants with proper concentric color bands
 */

import { gradientUtils } from '../utils/gradient.glsl'
import { materialUtils } from '../utils/materials.glsl'
import { warpUtils } from '../utils/warp.glsl'
import { geometryUtils } from '../utils/geometry.glsl'
import { effectsUtils } from '../utils/effects.glsl'
import { lavaLampUtils } from '../utils/lavaLamp.glsl'

export const radialGradientShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

// Color stops
uniform vec3 colorStops[10];
uniform float colorPositions[10];
uniform int numStops;

// Radial-specific uniforms
uniform float radialPosX;
uniform float radialPosY;
uniform float radialScaleX;
uniform float radialScaleY;
uniform float radialZoom;
uniform int radialRepeatMode;
uniform float aspectRatio;
// Radial shape variants
uniform int radialShape;           // 0=circle, 1=roundedRect, 2=squircle, 3=pill
uniform float radialCornerRadius;  // 0-1 normalized
uniform float radialShapeAspect;   // width/height ratio

${gradientUtils}
${materialUtils}
${geometryUtils}
${warpUtils}
${effectsUtils}
${lavaLampUtils}

// === Shape Distance Functions ===
// These return normalized distance where 0 = center, 1 = shape boundary
// The iso-lines are concentric versions of the shape (NOT circles)

// Circle: simple radial distance
float circleDistance(vec2 p, float radius) {
  return length(p) / radius;
}

// Rounded Rectangle: creates concentric rounded rectangles
// At 0% corners = sharp rectangle bands, at 100% = rounded rectangle bands (NOT circles)
float roundedRectDistance(vec2 p, vec2 size, float cornerPct) {
  // Normalize position to unit rectangle
  vec2 q = abs(p) / size;
  
  // Chebyshev distance gives rectangular iso-lines
  float rectDist = max(q.x, q.y);
  
  // Calculate corner rounding
  // Corner radius is fraction of the smaller dimension, capped at 0.5 to keep flat edges
  float maxCorner = 0.5;
  float cornerSize = cornerPct * maxCorner;
  float innerCorner = 1.0 - cornerSize;
  
  // Check if we're in a corner region
  if (q.x > innerCorner && q.y > innerCorner && cornerSize > 0.001) {
    // In corner region — blend from rect to circular
    vec2 cornerCenter = vec2(innerCorner, innerCorner);
    vec2 fromCorner = q - cornerCenter;
    float cornerDist = length(fromCorner) / cornerSize;
    return innerCorner + cornerDist * cornerSize;
  }
  
  // On flat edge — use Chebyshev (rectangular bands)
  return rectDist;
}

// Squircle (Superellipse): creates concentric squircle bands
// The formula |x|^n + |y|^n = r^n naturally creates concentric superellipses
float squircleDistance(vec2 p, vec2 size, float squareness) {
  // squareness: 0 = circle (n=2), 1 = more square (n=4)
  // Keep n <= 4 to avoid numerical issues and pointed corners
  float n = mix(2.0, 4.0, squareness);
  
  // Normalize by size
  vec2 q = abs(p) / size;
  
  // Superellipse distance: (|x|^n + |y|^n)^(1/n)
  // This naturally creates concentric superellipse iso-lines
  return pow(pow(q.x, n) + pow(q.y, n), 1.0 / n);
}

// Pill (Stadium): creates concentric stadium bands
// Stadium = two semicircles connected by straight lines
float pillDistance(vec2 p, vec2 size) {
  vec2 q = abs(p);
  
  // Determine orientation based on which dimension is larger
  if (size.x > size.y) {
    // Horizontal pill
    float r = size.y; // Radius of end caps
    float straightLen = size.x - size.y; // Length of straight section
    
    if (q.x <= straightLen) {
      // In straight section — distance is just Y normalized
      return q.y / r;
    } else {
      // In circular cap — distance from cap center
      vec2 capCenter = vec2(straightLen, 0.0);
      return length(q - capCenter) / r;
    }
  } else {
    // Vertical pill
    float r = size.x; // Radius of end caps
    float straightLen = size.y - size.x; // Length of straight section
    
    if (q.y <= straightLen) {
      // In straight section — distance is just X normalized
      return q.x / r;
    } else {
      // In circular cap — distance from cap center
      vec2 capCenter = vec2(0.0, straightLen);
      return length(q - capCenter) / r;
    }
  }
}

float getRadialT(vec2 uv) {
    // Get center position (with animation support)
    float centerX = radialPosX;
    float centerY = radialPosY;
    
    // Apply animated gradient center offset
    if (u_gradientCenterX != 50.0) {
        centerX = u_gradientCenterX / 100.0;
    }
    if (u_gradientCenterY != 50.0) {
        centerY = u_gradientCenterY / 100.0;
    }
    
    // Calculate delta from center (in UV space, 0-1)
    vec2 delta = uv - vec2(centerX, centerY);
    
    // Calculate base size from zoom (0.5 = half canvas at 100% zoom)
    float baseSize = 0.5 * radialZoom;
    
    // Calculate normalized distance based on shape
    // All functions return 0 at center, 1 at shape boundary
    float t;
    
    if (radialShape == 0) {
        // === CIRCLE ===
        // Circle should always be circular, so correct for canvas aspect
        vec2 correctedDelta = delta;
        correctedDelta.x *= aspectRatio;
        float radius = baseSize * max(radialScaleX, radialScaleY);
        t = circleDistance(correctedDelta, max(radius, 0.001));
        
    } else {
        // === NON-CIRCLE SHAPES ===
        // These shapes should naturally follow canvas proportions by default
        // A pill on a landscape canvas should be a horizontal pill
        // User can adjust with Scale X/Y and Aspect sliders
        
        // Start with canvas-proportional size
        // aspectRatio > 1 means landscape (wider), < 1 means portrait (taller)
        vec2 size;
        if (aspectRatio >= 1.0) {
            // Landscape: make shape wider
            size = vec2(baseSize * aspectRatio, baseSize);
        } else {
            // Portrait: make shape taller
            size = vec2(baseSize, baseSize / aspectRatio);
        }
        
        // Apply user's scale adjustments
        size *= vec2(radialScaleX, radialScaleY);
        
        // Apply user's shape aspect adjustment (1.0 = no change from canvas-proportional)
        if (radialShapeAspect >= 1.0) {
            size.x *= radialShapeAspect;
        } else {
            size.y /= radialShapeAspect;
        }
        
        // Prevent division by zero
        size = max(size, vec2(0.001));
        
        // For non-circle shapes, work in canvas-proportional space
        // Scale delta by aspect ratio so shapes look correct
        vec2 shapeDelta = delta;
        shapeDelta.x *= aspectRatio;
        
        if (radialShape == 1) {
            // === ROUNDED RECTANGLE ===
            t = roundedRectDistance(shapeDelta, size, radialCornerRadius);
            
        } else if (radialShape == 2) {
            // === SQUIRCLE ===
            t = squircleDistance(shapeDelta, size, radialCornerRadius);
            
        } else if (radialShape == 3) {
            // === PILL (STADIUM) ===
            t = pillDistance(shapeDelta, size);
            
        } else {
            // Fallback
            t = length(shapeDelta) / baseSize;
        }
    }
    
    // Apply inner/outer radius for animation control
    float inner = u_innerRadius / 100.0;
    float outer = u_outerRadius / 100.0;
    
    if (outer > inner) {
        t = (t - inner) / (outer - inner);
    }
    
    // Apply repeat mode
    return applyRepeat(t, radialRepeatMode);
}

vec3 sampleGradientAt(vec2 uv) {
    float t = getRadialT(uv);
    return getGradientColor(t);
}

vec3 applyChromatic(vec2 uv) {
    if (u_chromaticAmount < 0.1) return sampleGradientAt(uv);
    vec2 offset = getChromaticOffset(u_chromaticAmount, u_chromaticAngle);
    offset += getChromaticOffsetRadial(uv, u_chromaticAmount * 0.5);
    vec3 colorR = sampleGradientAt(uv + offset);
    vec3 colorG = sampleGradientAt(uv);
    vec3 colorB = sampleGradientAt(uv - offset);
    return vec3(colorR.r, colorG.g, colorB.b);
}

void main() {
    vec2 geometryUv = applyAllGeometry(vUv);
    vec2 warpedUv = applyAllWarps(geometryUv);
    
    // Apply lava lamp organic warp
    warpedUv = applyLavaLampWarp(warpedUv);
    
    // Apply pixelate before gradient sampling
    if (u_pixelateEnabled && u_pixelateSize > 0.0) {
        warpedUv = applyPixelateUV(warpedUv, u_pixelateSize);
    }
    
    vec3 color = u_chromaticEnabled ? applyChromatic(warpedUv) : sampleGradientAt(warpedUv);
    
    color = applyGeometryBevel(color, vUv);
    
    if (u_depthEnabled && u_depthShading) {
        color = apply3DShading(color, vUv, u_depthAmount, u_depthCenter);
    }
    
    color = applyMaterials(color, warpedUv);
    color = applyAllEffects(color, vUv, gl_FragCoord.xy);
    
    gl_FragColor = vec4(color, 1.0);
}
`

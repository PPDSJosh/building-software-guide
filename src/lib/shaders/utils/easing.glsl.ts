/**
 * Easing Functions
 * 
 * Standard easing functions for smooth transitions
 */

export const easingUtils = /* glsl */ `
// Quintic smoothstep - very smooth interpolation
float quintic(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Apply easing based on mode
// 0: linear, 1: easeIn, 2: easeOut, 3: easeInOut, 4: bounce
float applyEasing(float t, int mode) {
    if (mode == 1) { // easeIn (quadratic)
        return t * t;
    } else if (mode == 2) { // easeOut (quadratic)
        return 1.0 - (1.0 - t) * (1.0 - t);
    } else if (mode == 3) { // easeInOut (quadratic)
        return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0;
    } else if (mode == 4) { // bounce
        float n1 = 7.5625;
        float d1 = 2.75;
        if (t < 1.0 / d1) return n1 * t * t;
        else if (t < 2.0 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
        else if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
        t -= 2.625 / d1; return n1 * t * t + 0.984375;
    }
    return t; // linear (mode 0)
}

// Repeat mode: 0 = clamp, 1 = mirror
float applyRepeat(float t, int mode) {
    if (mode == 0) return clamp(t, 0.0, 1.0);
    // Mirror mode
    float ft = fract(t * 0.5) * 2.0;
    return ft > 1.0 ? 2.0 - ft : ft;
}
`















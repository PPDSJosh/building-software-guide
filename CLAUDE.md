# CLAUDE.md — Building Software with Claude Code (Scrolling Guide)

## Project Overview

Long-form scrolling editorial guide that teaches non-engineers how to build real software using Claude Code. Lives as a standalone web experience — designed editorial piece, not a docs site.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** GSAP + @gsap/react (ScrollTrigger for scroll-driven animation)
- **State:** Zustand
- **Gradients:** GradientLab WebGL engine (THREE.js) — NO CSS GRADIENTS EVER
- **Fonts:** Custom (Tusker Grotesk, BT Super Eighty, Bulevar, Canela, PP Neue Montreal, Miju)

## Hard Rules

1. **NO CSS GRADIENTS.** All gradients are rendered via the GradientLab WebGL engine using `<canvas>` elements. This includes backgrounds, planes, text fills — everything.
2. **Effects are mandatory.** GradientLab effects (grain, glow, chromatic aberration, vignette, halftone, scanlines, posterize, dither, pixelate) must be used to create rich, textured gradient surfaces. Only ASCII and dot matrix effects are excluded.
3. **GSAP only.** No CSS animations, no Framer Motion, no other animation libraries.
4. **TypeScript required.** No `.js` files.
5. **Tailwind CSS** for all styling. No CSS modules, no styled-components.
6. **Max 2 live WebGL instances** visible at any scroll position.

## Directory Structure

```
src/
  app/              — Next.js pages
  components/
    ui/             — Primitive components (ChromeBar, Grid, etc.)
    sections/       — Section-specific components
    gradient/       — Gradient rendering components
  lib/
    engine/         — GradientLab WebGL engine (extracted)
    shaders/        — GLSL shader code
    animation/      — GSAP animation utilities
    data/           — Static data, color tokens
    store/          — Zustand stores
    hooks/          — Custom React hooks
    utils/          — Pure utility functions
  types/            — TypeScript type definitions
```

## Spec Files

All design decisions are in the `../spec/` directory:
- `DESIGN-DIRECTION.md` — Complete design system (gradient, color, type, motion, layout, section identity)
- `RHYTHM-MAP.md` — Section-by-section treatment scoring
- `progress.md` — Spec completion tracker

## Build Plan

See `../plan/BUILD-PLAN.md` for the full build plan and `../plan/PROGRESS.md` for execution progress.

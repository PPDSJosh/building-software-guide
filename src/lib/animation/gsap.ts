'use client'

/**
 * GSAP Registration — central import point for GSAP and plugins.
 *
 * Import from here instead of 'gsap' directly to ensure plugins
 * are registered before use.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

/**
 * AsciiAtlasLoader - Browser-based ASCII atlas generation and loading
 *
 * Generates texture atlases in the browser using Canvas API.
 * Supports custom font uploads via FontFace API.
 * No node-canvas dependency required.
 */

import * as THREE from 'three'

// Configuration
const CELL_SIZE = 64
const FONT_SIZE = 48

// Character presets (ordered from light → dark by visual density)
export const ASCII_PRESETS = {
  classic: '.:;+=xX$&',
  minimal: '·:+■',
  blocks: '░▒▓█',
  binary: '01',
  braille: '⠁⠉⠋⠛⠿⣿',
} as const

export type AsciiPresetKey = keyof typeof ASCII_PRESETS

// Cache for generated textures
const textureCache = new Map<string, THREE.Texture>()

// Cache for loaded custom fonts
const fontCache = new Map<string, FontFace>()

/**
 * Load a custom font from a File object (uploaded by user)
 * Returns the font family name to use in ctx.font
 */
export async function loadCustomFont(file: File): Promise<string> {
  const fontName = `CustomAsciiFont_${Date.now()}`

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()

  // Create FontFace
  const fontFace = new FontFace(fontName, arrayBuffer)

  // Load the font
  await fontFace.load()

  // Add to document fonts
  document.fonts.add(fontFace)

  // Cache the font
  fontCache.set(fontName, fontFace)

  return fontName
}

/**
 * Load a custom font from base64 data URL
 * Returns the font family name to use in ctx.font
 */
export async function loadCustomFontFromBase64(base64Data: string, fontName?: string): Promise<string> {
  const name = fontName || `CustomAsciiFont_${Date.now()}`

  // Check if already loaded
  if (fontCache.has(name)) {
    return name
  }

  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Data.split(',')[1] || base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  // Create FontFace
  const fontFace = new FontFace(name, bytes.buffer)

  // Load the font
  await fontFace.load()

  // Add to document fonts
  document.fonts.add(fontFace)

  // Cache the font
  fontCache.set(name, fontFace)

  return name
}

/**
 * Convert a File to base64 data URL for storage
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Unload a custom font
 */
export function unloadCustomFont(fontName: string): void {
  const fontFace = fontCache.get(fontName)
  if (fontFace) {
    document.fonts.delete(fontFace)
    fontCache.delete(fontName)
  }

  // Clear any textures using this font
  textureCache.forEach((texture, key) => {
    if (key.includes(fontName)) {
      texture.dispose()
      textureCache.delete(key)
    }
  })
}

/**
 * Generate an ASCII atlas texture for a given character set
 * @param characters The characters to include in the atlas
 * @param customFontName Optional custom font name (loaded via loadCustomFont)
 */
export function generateAsciiAtlas(characters: string, customFontName?: string): THREE.Texture {
  // Create cache key that includes font
  const cacheKey = customFontName ? `${customFontName}:${characters}` : characters

  // Check cache first
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!
  }

  const charArray = Array.from(characters) // Handle Unicode properly
  const numChars = charArray.length

  if (numChars === 0) {
    // Return a placeholder texture for empty character sets
    const canvas = document.createElement('canvas')
    canvas.width = CELL_SIZE
    canvas.height = CELL_SIZE
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }

  // Create a horizontal strip atlas (1 row, N columns)
  const width = CELL_SIZE * numChars
  const height = CELL_SIZE

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!

  // Fill with transparent background
  ctx.clearRect(0, 0, width, height)

  // Configure text rendering
  // Use custom font if provided, otherwise use system fonts
  const fontFamily = customFontName
    ? `"${customFontName}"`
    : '"JetBrains Mono", "SF Mono", "Menlo", "Monaco", "Consolas", "Liberation Mono", monospace'
  ctx.font = `${FONT_SIZE}px ${fontFamily}`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Render each character
  charArray.forEach((char, i) => {
    const x = i * CELL_SIZE + CELL_SIZE / 2
    const y = CELL_SIZE / 2
    ctx.fillText(char, x, y)
  })

  // Create THREE.js texture from canvas
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  // Disable flipY - the shader already flips the V coordinate
  // Canvas has (0,0) at top-left, WebGL at bottom-left
  // The shader does: atlasV = 1.0 - cellUV.y to correct this
  texture.flipY = false
  texture.needsUpdate = true

  // Cache the texture
  textureCache.set(cacheKey, texture)

  return texture
}

/**
 * Get an ASCII atlas for a preset or custom character set
 * @param preset The preset to use, or 'custom' for custom characters
 * @param customChars Custom characters (when preset is 'custom')
 * @param customFontName Optional custom font name (loaded via loadCustomFont)
 */
export function getAsciiAtlas(
  preset: AsciiPresetKey | 'custom',
  customChars?: string,
  customFontName?: string
): THREE.Texture {
  const characters = preset === 'custom'
    ? (customChars || 'GradientLab')
    : ASCII_PRESETS[preset]

  return generateAsciiAtlas(characters, customFontName)
}

/**
 * Clear the texture cache (useful for memory management)
 */
export function clearAsciiAtlasCache(): void {
  textureCache.forEach(texture => texture.dispose())
  textureCache.clear()
}

/**
 * Get the number of characters in a preset or custom set
 */
export function getCharCount(preset: AsciiPresetKey | 'custom', customChars?: string): number {
  const characters = preset === 'custom' 
    ? (customChars || 'GradientLab')
    : ASCII_PRESETS[preset]
  
  return Array.from(characters).length
}

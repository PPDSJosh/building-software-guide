/**
 * GradientEngine - WebGL gradient rendering with UV-based warping
 * 
 * Uses a simple plane geometry with UV distortion in fragment shaders.
 * Blur, ASCII, and Dot Matrix are implemented as post-processing passes.
 */

import * as THREE from 'three'
import { ShaderManager, GradientType } from './ShaderManager'
import { generateAsciiAtlas, loadCustomFontFromBase64 } from './AsciiAtlasLoader'
import { dotMatrixVertexShader, dotMatrixFragmentShader } from '../shaders/postprocess/dotMatrix.glsl'
import { asciiVertexShader, asciiFragmentShader } from '../shaders/postprocess/ascii.glsl'
import type {
  ColorStop,
  LinearSettings, RadialSettings, ConicSettings, DiamondSettings,
  SpiralSettings, AuroraSettings, StripesSettings, FoldedSettings, ReverbSettings,
  BlendOptions, MaterialState, WarpState, GeometryEffectsState, EffectsState
} from '@/types/gradient'

// Blur fragment shader for post-processing
const blurFragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float u_blurAmount;
uniform vec2 u_resolution;
varying vec2 vUv;

void main() {
    if (u_blurAmount < 0.5) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
    }
    
    vec2 texelSize = 1.0 / u_resolution;
    float blur = u_blurAmount * 0.12;
    
    vec3 result = vec3(0.0);
    float total = 0.0;
    
    // Gaussian blur kernel - 13x13 samples for smooth result
    for (int x = -6; x <= 6; x++) {
        for (int y = -6; y <= 6; y++) {
            vec2 offset = vec2(float(x), float(y)) * texelSize * blur;
            float weight = exp(-float(x*x + y*y) / (blur * blur * 2.0 + 0.1));
            result += texture2D(tDiffuse, vUv + offset).rgb * weight;
            total += weight;
        }
    }
    
    gl_FragColor = vec4(result / total, 1.0);
}
`

const blurVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export class GradientEngine {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private quad: THREE.Mesh
  private shaderManager: ShaderManager
  private canvas: HTMLCanvasElement
  private animationFrameId: number | null = null
  private startTime: number = 0
  private isAnimating: boolean = false
  private currentType: GradientType = 'linear'
  
  // Post-processing render targets
  private renderTarget1: THREE.WebGLRenderTarget | null = null
  private renderTarget2: THREE.WebGLRenderTarget | null = null
  
  // Blur post-processing
  private blurScene: THREE.Scene
  private blurCamera: THREE.OrthographicCamera
  private blurQuad: THREE.Mesh
  private blurMaterial: THREE.ShaderMaterial
  private blurAmount: number = 0
  private blurEnabled: boolean = false
  
  // Dot Matrix post-processing
  private dotMatrixScene: THREE.Scene
  private dotMatrixQuad: THREE.Mesh
  private dotMatrixMaterial: THREE.ShaderMaterial
  private dotMatrixEnabled: boolean = false
  private dotMatrixSettings: {
    density: number
    shape: number
    sizeMin: number
    sizeMax: number
    colorMode: number
    monoColor: THREE.Color
    duoDark: THREE.Color
    duoLight: THREE.Color
    background: THREE.Color
    softness: number
    invert: boolean
    gap: number
  } = {
    density: 50,
    shape: 0,
    sizeMin: 0.1,
    sizeMax: 0.9,
    colorMode: 0,
    monoColor: new THREE.Color(1, 1, 1),
    duoDark: new THREE.Color(0, 0, 0),
    duoLight: new THREE.Color(1, 1, 1),
    background: new THREE.Color(0, 0, 0),
    softness: 0.1,
    invert: false,
    gap: 0.1
  }
  
  // ASCII post-processing
  private asciiScene: THREE.Scene
  private asciiQuad: THREE.Mesh
  private asciiMaterial: THREE.ShaderMaterial
  private asciiEnabled: boolean = false
  private asciiSettings: {
    density: number
    charCount: number
    colored: boolean
    monoColor: THREE.Color
    background: THREE.Color
    invert: boolean
  } = {
    density: 80,
    charCount: 10,
    colored: true,
    monoColor: new THREE.Color(1, 1, 1),
    background: new THREE.Color(0, 0, 0),
    invert: false
  }
  
  // Dimension retry tracking for containers that aren't ready yet
  private dimensionRetryId: number | null = null
  private lastValidWidth: number = 0
  private lastValidHeight: number = 0

  // ASCII atlas tracking
  private currentAsciiCharacters: string = ''
  private asciiAtlas: THREE.Texture | null = null

  // WebGL context loss recovery
  private contextLost: boolean = false
  private onContextRestored: (() => void) | null = null
  private onContextLost: (() => void) | null = null
  private boundHandleContextLost: (e: Event) => void
  private boundHandleContextRestored: (e: Event) => void

  constructor(canvas: HTMLCanvasElement, options?: { forExport?: boolean }) {
    this.canvas = canvas
    this.shaderManager = new ShaderManager()

    // Bind context loss handlers
    this.boundHandleContextLost = this.handleContextLost.bind(this)
    this.boundHandleContextRestored = this.handleContextRestored.bind(this)

    // For export, disable antialiasing to prevent edge softening at high res
    const useAntialias = !options?.forExport

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: useAntialias,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: options?.forExport ? 'high-performance' : 'default',
    })
    
    const pixelRatio = options?.forExport ? 1 : Math.min(window.devicePixelRatio, 2)
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    
    if (options?.forExport) {
      console.log(`[GradientEngine] Export mode: pixelRatio=${pixelRatio}, antialias=${useAntialias}`)
    }
    
    this.scene = new THREE.Scene()
    
    // Orthographic camera for 2D rendering
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    this.camera.position.z = 1
    
    // Main gradient quad
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = this.shaderManager.createMaterial(this.currentType)
    this.quad = new THREE.Mesh(geometry, material)
    this.scene.add(this.quad)
    
    // Shared post-process camera
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const postGeometry = new THREE.PlaneGeometry(2, 2)
    
    // Setup blur post-processing
    this.blurScene = new THREE.Scene()
    this.blurCamera = postCamera.clone()
    this.blurMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        u_blurAmount: { value: 0 },
        u_resolution: { value: new THREE.Vector2(1, 1) }
      },
      vertexShader: blurVertexShader,
      fragmentShader: blurFragmentShader
    })
    this.blurQuad = new THREE.Mesh(postGeometry.clone(), this.blurMaterial)
    this.blurScene.add(this.blurQuad)
    
    // Setup Dot Matrix post-processing
    this.dotMatrixScene = new THREE.Scene()
    this.dotMatrixMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_density: { value: 50 },
        u_shape: { value: 0 },
        u_sizeMin: { value: 0.1 },
        u_sizeMax: { value: 0.9 },
        u_colorMode: { value: 0 },
        u_monoColor: { value: new THREE.Color(1, 1, 1) },
        u_duoDark: { value: new THREE.Color(0, 0, 0) },
        u_duoLight: { value: new THREE.Color(1, 1, 1) },
        u_background: { value: new THREE.Color(0, 0, 0) },
        u_softness: { value: 0.1 },
        u_invert: { value: false },
        u_gap: { value: 0.1 },
        u_time: { value: 0 },
        // Perspective uniforms
        u_perspectiveEnabled: { value: false },
        u_perspectiveTiltX: { value: 0 },
        u_perspectiveTiltY: { value: 0 }
      },
      vertexShader: dotMatrixVertexShader,
      fragmentShader: dotMatrixFragmentShader
    })
    this.dotMatrixQuad = new THREE.Mesh(postGeometry.clone(), this.dotMatrixMaterial)
    this.dotMatrixScene.add(this.dotMatrixQuad)
    
    // Setup ASCII post-processing
    this.asciiScene = new THREE.Scene()
    this.asciiMaterial = new THREE.ShaderMaterial({
      uniforms: {
        // Core uniforms
        tDiffuse: { value: null },
        u_asciiAtlas: { value: null },
        u_resolution: { value: new THREE.Vector2(1, 1) },
        u_density: { value: 80 },
        u_charCount: { value: 10 },
        u_colored: { value: true },
        u_monoColor: { value: new THREE.Color(1, 1, 1) },
        u_background: { value: new THREE.Color(0, 0, 0) },
        u_invert: { value: false },
        // Typography uniforms
        u_rotation: { value: 0 },
        u_lineHeight: { value: 1.0 },
        u_letterSpacing: { value: 1.0 },
        // Shadow uniforms
        u_shadowEnabled: { value: false },
        u_shadowColor: { value: new THREE.Color(0, 0, 0) },
        u_shadowOffsetX: { value: 2 },
        u_shadowOffsetY: { value: 2 },
        u_shadowBlur: { value: 0 },
        // Glow uniforms
        u_glowEnabled: { value: false },
        u_glowAmount: { value: 50 },
        u_glowRadius: { value: 0.3 },
        // Perspective uniforms
        u_perspectiveEnabled: { value: false },
        u_perspectiveTiltX: { value: 0 },
        u_perspectiveTiltY: { value: 0 },
        // Edge detection uniforms
        u_edgeEnabled: { value: false },
        u_edgeThreshold: { value: 0.5 }
      },
      vertexShader: asciiVertexShader,
      fragmentShader: asciiFragmentShader
    })
    this.asciiQuad = new THREE.Mesh(postGeometry.clone(), this.asciiMaterial)
    this.asciiScene.add(this.asciiQuad)

    // Add WebGL context loss/restore event listeners
    this.canvas.addEventListener('webglcontextlost', this.boundHandleContextLost, false)
    this.canvas.addEventListener('webglcontextrestored', this.boundHandleContextRestored, false)

    this.handleResize()
    this.startTime = performance.now()
  }

  /**
   * Handle WebGL context loss - happens when GPU resources are reclaimed
   * by the browser (tab backgrounded, GPU memory pressure, etc.)
   */
  private handleContextLost(event: Event): void {
    event.preventDefault() // Allow context restoration
    this.contextLost = true
    this.stopAnimation()
    console.warn('[GradientEngine] WebGL context lost - waiting for restoration')
    if (this.onContextLost) {
      this.onContextLost()
    }
  }

  /**
   * Handle WebGL context restoration - reinitialize all GPU resources
   */
  private handleContextRestored(): void {
    console.log('[GradientEngine] WebGL context restored - reinitializing')
    this.contextLost = false

    // Recreate render targets
    const pixelRatio = this.renderer.getPixelRatio()
    const renderW = Math.floor(this.lastValidWidth * pixelRatio)
    const renderH = Math.floor(this.lastValidHeight * pixelRatio)

    if (renderW > 0 && renderH > 0) {
      const rtOptions = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      }

      if (this.renderTarget1) this.renderTarget1.dispose()
      if (this.renderTarget2) this.renderTarget2.dispose()
      this.renderTarget1 = new THREE.WebGLRenderTarget(renderW, renderH, rtOptions)
      this.renderTarget2 = new THREE.WebGLRenderTarget(renderW, renderH, rtOptions)
    }

    // Regenerate ASCII atlas if needed
    if (this.asciiEnabled && this.currentAsciiCharacters) {
      const characters = this.currentAsciiCharacters.split(':')[0] || 'GradientLab'
      if (this.asciiAtlas) this.asciiAtlas.dispose()
      this.asciiAtlas = generateAsciiAtlas(characters)
      this.asciiMaterial.uniforms.u_asciiAtlas.value = this.asciiAtlas
    }

    // Notify external listeners
    if (this.onContextRestored) {
      this.onContextRestored()
    }

    // Force a render to show current state
    this.render()
  }

  /**
   * Check if the WebGL context is currently lost
   */
  isContextLost(): boolean {
    return this.contextLost
  }

  /**
   * Set callbacks for context loss/restoration events
   */
  setContextCallbacks(onLost: (() => void) | null, onRestored: (() => void) | null): void {
    this.onContextLost = onLost
    this.onContextRestored = onRestored
  }
  
  handleResize(width?: number, height?: number): void {
    if (this.dimensionRetryId !== null) {
      cancelAnimationFrame(this.dimensionRetryId)
      this.dimensionRetryId = null
    }
    
    const w = width ?? this.canvas.clientWidth
    const h = height ?? this.canvas.clientHeight
    
    if (w === 0 || h === 0) {
      this.scheduleResizeRetry()
      return
    }
    
    this.lastValidWidth = w
    this.lastValidHeight = h
    
    this.renderer.setSize(w, h, false)
    this.shaderManager.setAspectRatio(w, h)
    
    const pixelRatio = this.renderer.getPixelRatio()
    const renderW = Math.floor(w * pixelRatio)
    const renderH = Math.floor(h * pixelRatio)
    
    // Create/resize render targets
    if (this.renderTarget1) this.renderTarget1.dispose()
    if (this.renderTarget2) this.renderTarget2.dispose()
    
    const rtOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    }
    this.renderTarget1 = new THREE.WebGLRenderTarget(renderW, renderH, rtOptions)
    this.renderTarget2 = new THREE.WebGLRenderTarget(renderW, renderH, rtOptions)
    
    // Update all post-process shader resolutions
    const resolution = new THREE.Vector2(renderW, renderH)
    this.blurMaterial.uniforms.u_resolution.value.copy(resolution)
    this.dotMatrixMaterial.uniforms.u_resolution.value.copy(resolution)
    this.asciiMaterial.uniforms.u_resolution.value.copy(resolution)
  }
  
  private scheduleResizeRetry(attempts: number = 0): void {
    if (attempts >= 20) {
      console.warn('[GradientEngine] Failed to get valid dimensions after retries')
      return
    }
    
    this.dimensionRetryId = requestAnimationFrame(() => {
      this.dimensionRetryId = null
      const w = this.canvas.clientWidth
      const h = this.canvas.clientHeight
      
      if (w > 0 && h > 0) {
        this.handleResize(w, h)
        this.render()
      } else {
        this.scheduleResizeRetry(attempts + 1)
      }
    })
  }
  
  forceContainerFit(): void {
    const parent = this.canvas.parentElement
    if (!parent) return
    
    const rect = parent.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width
      this.canvas.height = rect.height
      this.handleResize(rect.width, rect.height)
      this.render()
    } else {
      this.scheduleResizeRetry()
    }
  }
  
  hasValidDimensions(): boolean {
    return this.lastValidWidth > 0 && this.lastValidHeight > 0
  }
  
  setGradientType(type: string): void {
    const validTypes: GradientType[] = ['linear', 'radial', 'conic', 'diamond', 'spiral', 'aurora', 'stripes', 'folded', 'reverb']
    if (!validTypes.includes(type as GradientType)) return
    const gradientType = type as GradientType
    if (gradientType !== this.currentType) {
      this.currentType = gradientType
      const material = this.shaderManager.setGradientType(gradientType)
      if (material) this.quad.material = material
    }
  }
  
  setColorStops(stops: ColorStop[]): void { this.shaderManager.setColorStops(stops) }
  setAngle(angle: number): void { this.shaderManager.setAngle(angle) }
  setCenter(x: number, y: number): void { this.shaderManager.setCenter(x, y) }
  setBlendOptions(options: BlendOptions): void { this.shaderManager.setBlendOptions(options) }
  
  setLinearSettings(settings: LinearSettings): void { this.shaderManager.setLinearSettings(settings) }
  setRadialSettings(settings: RadialSettings): void { this.shaderManager.setRadialSettings(settings) }
  setConicSettings(settings: ConicSettings): void { this.shaderManager.setConicSettings(settings) }
  setDiamondSettings(settings: DiamondSettings): void { this.shaderManager.setDiamondSettings(settings) }
  setSpiralSettings(settings: SpiralSettings): void { this.shaderManager.setSpiralSettings(settings) }
  setAuroraSettings(settings: AuroraSettings): void { this.shaderManager.setAuroraSettings(settings) }
  setStripesSettings(settings: StripesSettings): void { this.shaderManager.setStripesSettings(settings) }
  setFoldedSettings(settings: FoldedSettings): void { this.shaderManager.setFoldedSettings(settings) }
  setReverbSettings(settings: ReverbSettings): void { this.shaderManager.setReverbSettings(settings) }
  setMaterialSettings(materials: MaterialState): void { this.shaderManager.setMaterialSettings(materials) }
  setGeometryEffectsSettings(effects: GeometryEffectsState): void { this.shaderManager.setGeometryEffectsSettings(effects) }
  
  setEffectsSettings(effects: EffectsState): void { 
    // Handle ASCII settings
    if (effects.ascii) {
      this.asciiEnabled = effects.ascii.enabled ?? false
      
      if (this.asciiEnabled) {
        const characters = effects.ascii.characters || 'GradientLab'
        const customFont = effects.ascii.customFont || null
        const customFontName = effects.ascii.customFontName || null

        // Create a cache key that includes both characters and font
        const cacheKey = `${characters}:${customFontName || 'default'}`

        // Regenerate atlas if characters or font changed, or if atlas doesn't exist
        if (cacheKey !== this.currentAsciiCharacters || !this.asciiAtlas) {
          this.currentAsciiCharacters = cacheKey

          if (this.asciiAtlas) {
            this.asciiAtlas.dispose()
          }

          // Load custom font if provided, then generate atlas
          if (customFont && customFontName) {
            // Generate atlas with default font first (so we have something to render)
            this.asciiAtlas = generateAsciiAtlas(characters)
            this.asciiMaterial.uniforms.u_asciiAtlas.value = this.asciiAtlas
            this.asciiMaterial.uniforms.u_charCount.value = Array.from(characters).length

            // Then try to load custom font and regenerate
            loadCustomFontFromBase64(customFont, customFontName)
              .then((fontName) => {
                if (this.asciiAtlas) this.asciiAtlas.dispose()
                this.asciiAtlas = generateAsciiAtlas(characters, fontName)
                this.asciiMaterial.uniforms.u_asciiAtlas.value = this.asciiAtlas
              })
              .catch((err) => {
                console.warn('[GradientEngine] Failed to load custom font:', err)
              })
          } else {
            this.asciiAtlas = generateAsciiAtlas(characters)
            this.asciiMaterial.uniforms.u_asciiAtlas.value = this.asciiAtlas
            this.asciiMaterial.uniforms.u_charCount.value = Array.from(characters).length
          }
        }
        
        // Update ASCII uniforms - Core
        this.asciiMaterial.uniforms.u_density.value = effects.ascii.density ?? 80
        this.asciiMaterial.uniforms.u_colored.value = effects.ascii.colorMode === 'colored'
        this.asciiMaterial.uniforms.u_invert.value = effects.ascii.invert ?? false

        if (effects.ascii.monoColor) {
          this.asciiMaterial.uniforms.u_monoColor.value.set(effects.ascii.monoColor)
        }
        if (effects.ascii.backgroundColor) {
          this.asciiMaterial.uniforms.u_background.value.set(effects.ascii.backgroundColor)
        }

        // Update ASCII uniforms - Typography
        this.asciiMaterial.uniforms.u_rotation.value = effects.ascii.rotation ?? 0
        this.asciiMaterial.uniforms.u_lineHeight.value = (effects.ascii.lineHeight ?? 100) / 100
        this.asciiMaterial.uniforms.u_letterSpacing.value = (effects.ascii.letterSpacing ?? 100) / 100

        // Update ASCII uniforms - Shadow
        const shadow = effects.ascii.shadow
        this.asciiMaterial.uniforms.u_shadowEnabled.value = shadow?.enabled ?? false
        if (shadow?.color) {
          this.asciiMaterial.uniforms.u_shadowColor.value.set(shadow.color)
        }
        this.asciiMaterial.uniforms.u_shadowOffsetX.value = shadow?.offsetX ?? 2
        this.asciiMaterial.uniforms.u_shadowOffsetY.value = shadow?.offsetY ?? 2
        this.asciiMaterial.uniforms.u_shadowBlur.value = (shadow?.blur ?? 0) / 100

        // Update ASCII uniforms - Glow
        const glow = effects.ascii.glow
        this.asciiMaterial.uniforms.u_glowEnabled.value = glow?.enabled ?? false
        this.asciiMaterial.uniforms.u_glowAmount.value = glow?.amount ?? 50
        this.asciiMaterial.uniforms.u_glowRadius.value = (glow?.radius ?? 30) / 100

        // Update ASCII uniforms - Perspective
        const perspective = effects.ascii.perspective
        this.asciiMaterial.uniforms.u_perspectiveEnabled.value = perspective?.enabled ?? false
        this.asciiMaterial.uniforms.u_perspectiveTiltX.value = perspective?.tiltX ?? 0
        this.asciiMaterial.uniforms.u_perspectiveTiltY.value = perspective?.tiltY ?? 0

        // Update ASCII uniforms - Edge Detection
        const edge = effects.ascii.edge
        this.asciiMaterial.uniforms.u_edgeEnabled.value = edge?.enabled ?? false
        this.asciiMaterial.uniforms.u_edgeThreshold.value = (edge?.threshold ?? 50) / 100
      }
    } else {
      this.asciiEnabled = false
    }
    
    // Handle Dot Matrix settings
    if (effects.dotMatrix) {
      this.dotMatrixEnabled = effects.dotMatrix.enabled ?? false
      
      if (this.dotMatrixEnabled) {
        const dm = this.dotMatrixMaterial.uniforms
        dm.u_density.value = effects.dotMatrix.density ?? 60
        
        // Map shape string to int: circle=0, square=1, diamond=2
        const shapeMap: Record<string, number> = { circle: 0, square: 1, diamond: 2 }
        dm.u_shape.value = shapeMap[effects.dotMatrix.shape] ?? 0
        
        // Convert 0-100 to 0-1
        dm.u_sizeMin.value = (effects.dotMatrix.sizeMin ?? 10) / 100
        dm.u_sizeMax.value = (effects.dotMatrix.sizeMax ?? 100) / 100
        
        // Map colorMode string to int: colored=0, mono=1, duotone=2
        const colorModeMap: Record<string, number> = { colored: 0, mono: 1, duotone: 2 }
        dm.u_colorMode.value = colorModeMap[effects.dotMatrix.colorMode] ?? 0
        
        dm.u_softness.value = (effects.dotMatrix.softness ?? 0) / 100
        dm.u_invert.value = effects.dotMatrix.invert ?? false
        dm.u_gap.value = (effects.dotMatrix.gap ?? 0) / 100
        
        if (effects.dotMatrix.monoColor) {
          dm.u_monoColor.value.set(effects.dotMatrix.monoColor)
        }
        if (effects.dotMatrix.duotoneDark) {
          dm.u_duoDark.value.set(effects.dotMatrix.duotoneDark)
        }
        if (effects.dotMatrix.duotoneLight) {
          dm.u_duoLight.value.set(effects.dotMatrix.duotoneLight)
        }
        if (effects.dotMatrix.backgroundColor) {
          dm.u_background.value.set(effects.dotMatrix.backgroundColor)
        }

        // Perspective
        dm.u_perspectiveEnabled.value = effects.dotMatrix.perspective?.enabled ?? false
        dm.u_perspectiveTiltX.value = effects.dotMatrix.perspective?.tiltX ?? 0
        dm.u_perspectiveTiltY.value = effects.dotMatrix.perspective?.tiltY ?? 0
      }
    } else {
      this.dotMatrixEnabled = false
    }
    
    // Pass other effects to shader manager
    this.shaderManager.setEffectsSettings(effects) 
  }
  
  setWarpSettings(warp: WarpState): void { 
    this.shaderManager.setWarpSettings(warp)
    this.blurEnabled = warp.blur?.enabled ?? false
    this.blurAmount = warp.blur?.amount ?? 0
  }
  
  // Lava Lamp settings
  setLavaLampEnabled(enabled: boolean): void { this.shaderManager.setLavaLampEnabled(enabled) }
  setLavaLampIntensity(intensity: number): void { this.shaderManager.setLavaLampIntensity(intensity) }
  setLavaLampBlobCount(count: number): void { this.shaderManager.setLavaLampBlobCount(count) }
  setLavaLampTime(time: number): void { this.shaderManager.setLavaLampTime(time) }
  
  render(): void {
    // Skip rendering if context is lost
    if (this.contextLost) return
    const elapsed = (performance.now() - this.startTime) / 1000
    this.renderAtTime(elapsed)
  }
  
  /**
   * Render at a specific time - useful for exports where we control the animation time
   * 
   * Rendering pipeline:
   * 1. Render gradient to texture (if post-processing needed)
   * 2. Apply ASCII or Dot Matrix (mutually exclusive)
   * 3. Apply blur (if enabled)
   * 4. Render to screen
   */
  renderAtTime(time: number): void {
    this.shaderManager.setTime(time)
    
    const needsPostProcess = this.asciiEnabled || this.dotMatrixEnabled || (this.blurEnabled && this.blurAmount > 0)
    
    if (!needsPostProcess || !this.renderTarget1 || !this.renderTarget2) {
      // Direct render - no post-processing
      this.renderer.setRenderTarget(null)
      this.renderer.render(this.scene, this.camera)
      return
    }
    
    // Pass 1: Render gradient to texture
    this.renderer.setRenderTarget(this.renderTarget1)
    this.renderer.render(this.scene, this.camera)
    
    let currentSource = this.renderTarget1
    let currentTarget = this.renderTarget2
    
    // Pass 2: ASCII or Dot Matrix (mutually exclusive - ASCII takes priority)
    if (this.asciiEnabled && this.asciiAtlas) {
      this.asciiMaterial.uniforms.tDiffuse.value = currentSource.texture
      this.renderer.setRenderTarget(currentTarget)
      this.renderer.render(this.asciiScene, this.blurCamera)
      
      // Swap buffers
      ;[currentSource, currentTarget] = [currentTarget, currentSource]
    } else if (this.dotMatrixEnabled) {
      this.dotMatrixMaterial.uniforms.tDiffuse.value = currentSource.texture
      this.dotMatrixMaterial.uniforms.u_time.value = time
      this.renderer.setRenderTarget(currentTarget)
      this.renderer.render(this.dotMatrixScene, this.blurCamera)
      
      // Swap buffers
      ;[currentSource, currentTarget] = [currentTarget, currentSource]
    }
    
    // Pass 3: Blur (if enabled)
    if (this.blurEnabled && this.blurAmount > 0) {
      this.blurMaterial.uniforms.tDiffuse.value = currentSource.texture
      this.blurMaterial.uniforms.u_blurAmount.value = this.blurAmount
      this.renderer.setRenderTarget(currentTarget)
      this.renderer.render(this.blurScene, this.blurCamera)
      
      // Swap for final output
      ;[currentSource, currentTarget] = [currentTarget, currentSource]
    }
    
    // Final pass: Render to screen
    // We need to copy from currentSource to screen
    // Use blur material as a passthrough (amount=0 just copies)
    this.blurMaterial.uniforms.tDiffuse.value = currentSource.texture
    this.blurMaterial.uniforms.u_blurAmount.value = 0
    this.renderer.setRenderTarget(null)
    this.renderer.render(this.blurScene, this.blurCamera)
  }
  
  renderAtTimeSync(time: number): void {
    this.renderAtTime(time)
    const gl = this.renderer.getContext()
    gl.finish()
  }
  
  startAnimation(): void {
    if (this.isAnimating) return
    this.isAnimating = true
    this.startTime = performance.now()
    const animate = () => {
      if (!this.isAnimating) return
      this.render()
      this.animationFrameId = requestAnimationFrame(animate)
    }
    animate()
  }
  
  stopAnimation(): void {
    this.isAnimating = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
  
  getCanvas(): HTMLCanvasElement { return this.canvas }
  getRenderer(): THREE.WebGLRenderer { return this.renderer }
  
  exportAsDataURL(format: 'png' | 'jpeg' = 'png', quality?: number): string {
    this.render()
    return this.canvas.toDataURL(`image/${format}`, quality)
  }
  
  exportAsBlob(format: 'png' | 'jpeg' = 'png', quality?: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.render()
      this.canvas.toBlob((blob) => resolve(blob), `image/${format}`, quality)
    })
  }
  
  applyAnimationOverrides(overrides: Record<string, number>): void {
    const uniforms = this.shaderManager.getUniforms()
    
    for (const [path, value] of Object.entries(overrides)) {
      const parts = path.split('.')
      
      if (parts.length === 1) {
        if (parts[0] === 'angle') {
          uniforms.angle.value = value
        }
      }
      else if (parts[0] === 'warp' && parts.length === 3) {
        const [, warpName, prop] = parts
        
        const warpMap: Record<string, Record<string, string>> = {
          bend: { enabled: 'u_bendAmount', amount: 'u_bendAmount', axis: 'u_bendAxis', pinch: 'u_bendPinch' },
          twist: { enabled: 'u_twistAmount', amount: 'u_twistAmount', radius: 'u_twistRadius', centerX: 'u_twistCenter', centerY: 'u_twistCenter' },
          wave: { enabled: 'u_waveAmplitude', amplitude: 'u_waveAmplitude', frequency: 'u_waveFrequency', rotation: 'u_waveRotation' },
          ripple: { enabled: 'u_rippleAmplitude', amplitude: 'u_rippleAmplitude', frequency: 'u_rippleFrequency', decay: 'u_rippleDecay', centerX: 'u_rippleCenter', centerY: 'u_rippleCenter', rotation: 'u_rippleRotation' },
          sphere: { enabled: 'u_sphereAmount', amount: 'u_sphereAmount', radius: 'u_sphereRadius', centerX: 'u_sphereCenter', centerY: 'u_sphereCenter' },
          bulge: { enabled: 'u_bulgeAmount', amount: 'u_bulgeAmount', radius: 'u_bulgeRadius', centerX: 'u_bulgeCenter', centerY: 'u_bulgeCenter' },
          blur: { enabled: 'blur_enabled', amount: 'blur_amount' },
        }
        
        if (warpName === 'blur') {
          if (prop === 'enabled') {
            this.blurEnabled = value >= 0.5
          } else if (prop === 'amount') {
            this.blurAmount = value
          }
        } else if (warpMap[warpName]) {
          const uniformBase = warpMap[warpName][prop]
          if (uniformBase && uniforms[uniformBase]) {
            if (prop === 'enabled') {
              // handled by warp state
            } else if (prop === 'centerX' || prop === 'centerY') {
              const centerUniform = uniforms[uniformBase] as THREE.Uniform<THREE.Vector2> | undefined
              if (centerUniform && centerUniform.value) {
                if (prop === 'centerX') {
                  centerUniform.value.x = value * 0.01
                } else {
                  centerUniform.value.y = value * 0.01
                }
              }
            } else {
              uniforms[uniformBase].value = value
            }
          }
        }
      }
      else if (parts[0] === 'materials' && parts.length === 3) {
        const [, matName, prop] = parts
        
        const matMap: Record<string, Record<string, string>> = {
          iridescent: { enabled: 'matIridescentEnabled', intensity: 'matIridescentIntensity', scale: 'matIridescentScale', shift: 'matIridescentShift' },
          metallic: { enabled: 'matMetallicEnabled', intensity: 'matMetallicIntensity', highlight: 'matMetallicHighlight', contrast: 'matMetallicContrast' },
          holographic: { enabled: 'matHolographicEnabled', intensity: 'matHolographicIntensity', density: 'matHolographicDensity', angle: 'matHolographicAngle' },
          velvet: { enabled: 'matVelvetEnabled', intensity: 'matVelvetIntensity', depth: 'matVelvetDepth', glow: 'matVelvetGlow' },
        }
        
        if (matMap[matName] && matMap[matName][prop]) {
          const uniformName = matMap[matName][prop]
          if (uniforms[uniformName]) {
            if (prop === 'enabled') {
              uniforms[uniformName].value = value >= 0.5 ? 1 : 0
            } else {
              uniforms[uniformName].value = value
            }
          }
        }
      }
      else if (parts[0] === 'effects' && parts.length === 3) {
        const [, effectName, prop] = parts
        
        const effectMap: Record<string, Record<string, string>> = {
          chromatic: { enabled: 'u_chromaticEnabled', amount: 'u_chromaticAmount', angle: 'u_chromaticAngle' },
          glow: { enabled: 'u_glowEnabled', amount: 'u_glowAmount', threshold: 'u_glowThreshold' },
          vignette: { enabled: 'u_vignetteEnabled', amount: 'u_vignetteAmount', softness: 'u_vignetteSoftness' },
          grain: { enabled: 'u_grainEnabled', amount: 'u_grainAmount', size: 'u_grainSize' },
          posterize: { enabled: 'u_posterizeEnabled', levels: 'u_posterizeLevels' },
        }
        
        if (effectMap[effectName] && effectMap[effectName][prop]) {
          const uniformName = effectMap[effectName][prop]
          if (uniforms[uniformName]) {
            if (prop === 'enabled') {
              uniforms[uniformName].value = value >= 0.5
            } else {
              uniforms[uniformName].value = value
            }
          }
        }
      }
    }
  }
  
  getUniforms(): Record<string, { value: number }> {
    return this.shaderManager.getUniforms() as unknown as Record<string, { value: number }>
  }

  dispose(forceContextLoss: boolean = false): void {
    this.stopAnimation()

    // Remove context loss event listeners
    this.canvas.removeEventListener('webglcontextlost', this.boundHandleContextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.boundHandleContextRestored)
    this.onContextLost = null
    this.onContextRestored = null

    if (this.dimensionRetryId !== null) {
      cancelAnimationFrame(this.dimensionRetryId)
      this.dimensionRetryId = null
    }

    // Dispose geometries
    if (this.quad.geometry) this.quad.geometry.dispose()
    if (this.blurQuad.geometry) this.blurQuad.geometry.dispose()
    if (this.dotMatrixQuad.geometry) this.dotMatrixQuad.geometry.dispose()
    if (this.asciiQuad.geometry) this.asciiQuad.geometry.dispose()
    
    // Dispose materials
    if (this.blurMaterial) this.blurMaterial.dispose()
    if (this.dotMatrixMaterial) this.dotMatrixMaterial.dispose()
    if (this.asciiMaterial) this.asciiMaterial.dispose()
    
    // Dispose render targets
    if (this.renderTarget1) this.renderTarget1.dispose()
    if (this.renderTarget2) this.renderTarget2.dispose()
    
    // Dispose textures
    if (this.asciiAtlas) this.asciiAtlas.dispose()
    
    this.shaderManager.dispose()
    
    if (forceContextLoss) {
      try {
        const gl = this.renderer.getContext()
        const loseContext = gl.getExtension('WEBGL_lose_context')
        if (loseContext) {
          loseContext.loseContext()
        }
      } catch {
        // Ignore
      }
      this.renderer.forceContextLoss()
    }
    
    this.renderer.dispose()
    this.scene.clear()
    this.blurScene.clear()
    this.dotMatrixScene.clear()
    this.asciiScene.clear()
  }
}

/// <reference lib="webworker" />

declare const self: DedicatedWorkerGlobalScope

console.log('🎬 [DEBUG] Scene detection worker loaded and ready')

import type {
  SceneChangeResult,
  SceneChangeLevel,
  SceneChangeConfig,
  SceneChangeStreamChunk,
  SceneChangeStreamComplete,
  SceneChangeStreamError,
  SceneChangeWorkerMessage
} from '../types/detection'
import {
  DEFAULT_SCENE_CONFIG,
  gaussianKernel,
  rgbToGrayscale,
  applyGaussianBlur,
  calculateFrameDifference,
  calculateEdgeDifference,
  applySobelEdgeDetection,
  applyMorphologicalOps,
  downsampleImageData,
  classifyChangeLevel,
  calculateMotionVectors
} from '../lib/scene-detection-utils'

type StartSceneDetectionMessage = {
  type: 'startSceneDetection'
  payload: {
    duration: number
    config?: Partial<SceneChangeConfig>
  }
}

type ProcessSceneFrameMessage = {
  type: 'processSceneFrame'
  payload: {
    frameData: ImageData | ImageBitmap
    timestamp: number
  }
}

type TerminateSceneDetectionMessage = { type: 'terminateSceneDetection' }

type IncomingSceneMessage = StartSceneDetectionMessage | ProcessSceneFrameMessage | TerminateSceneDetectionMessage

// Frame buffer for temporal analysis
interface BufferedFrame {
  data: ImageData
  timestamp: number
  edgeData: Uint8ClampedArray
}

let config: SceneChangeConfig = DEFAULT_SCENE_CONFIG
let frameBuffer: BufferedFrame[] = []
let results: SceneChangeResult[] = []
let isProcessing = false
let processingTimeout: number | undefined

// WebGL utilities for GPU-accelerated processing
class WebGLProcessor {
  private gl: WebGLRenderingContext | null = null
  private canvas: OffscreenCanvas | null = null
  private programs: Map<string, WebGLProgram> = new Map()
  private textures: Map<string, WebGLTexture> = new Map()
  private framebuffers: Map<string, WebGLFramebuffer> = new Map()

  initialize(width: number, height: number): boolean {
    try {
      this.canvas = new OffscreenCanvas(width, height)
      this.gl = this.canvas.getContext('webgl')

      if (!this.gl) {
        console.warn('WebGL not available, falling back to CPU processing')
        return false
      }

      // Initialize WebGL extensions
      this.gl.getExtension('OES_texture_float')
      this.gl.getExtension('WEBGL_color_buffer_float')

      return true
    } catch (error) {
      console.warn('Failed to initialize WebGL:', error)
      return false
    }
  }

  createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null

    const shader = this.gl.createShader(type)
    if (!shader) return null

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader))
      this.gl.deleteShader(shader)
      return null
    }

    return shader
  }

  createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)

    if (!vertexShader || !fragmentShader) return null

    const program = this.gl.createProgram()
    if (!program) return null

    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program))
      this.gl.deleteProgram(program)
      return null
    }

    this.gl.deleteShader(vertexShader)
    this.gl.deleteShader(fragmentShader)

    return program
  }

  createTexture(imageData: ImageData): WebGLTexture | null {
    if (!this.gl) return null

    const texture = this.gl.createTexture()
    if (!texture) return null

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, imageData)

    return texture
  }

  // GPU-accelerated grayscale conversion
  convertToGrayscaleGPU(imageData: ImageData): Uint8ClampedArray | null {
    if (!this.gl) return null

    const programKey = 'grayscale'
    let program = this.programs.get(programKey)

    if (!program) {
      const vertexShader = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;

        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `

      const fragmentShader = `
        precision mediump float;
        uniform sampler2D u_image;
        varying vec2 v_texCoord;

        void main() {
          vec4 color = texture2D(u_image, v_texCoord);
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          gl_FragColor = vec4(vec3(gray), 1.0);
        }
      `

      program = this.createProgram(vertexShader, fragmentShader)
      if (program) {
        this.programs.set(programKey, program)
      }
    }

    if (!program) return null

    // Create texture from input image
    const inputTexture = this.createTexture(imageData)
    if (!inputTexture) return null

    // Create framebuffer for output
    const framebuffer = this.gl.createFramebuffer()
    if (!framebuffer) return null

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer)

    // Create output texture
    const outputTexture = this.gl.createTexture()
    if (!outputTexture) return null

    this.gl.bindTexture(this.gl.TEXTURE_2D, outputTexture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, imageData.width, imageData.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null)
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, outputTexture, 0)

    // Set up viewport and clear
    this.gl.viewport(0, 0, imageData.width, imageData.height)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    // Use program and set uniforms
    this.gl.useProgram(program)

    // Set up vertex attributes
    const positionLocation = this.gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = this.gl.getAttribLocation(program, 'a_texCoord')

    // Create quad vertices
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ])

    const texCoords = new Float32Array([
      0, 1,
      1, 1,
      0, 0,
      1, 0
    ])

    const positionBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW)
    this.gl.enableVertexAttribArray(positionLocation)
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0)

    const texCoordBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW)
    this.gl.enableVertexAttribArray(texCoordLocation)
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0)

    // Bind input texture
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, inputTexture)
    this.gl.uniform1i(this.gl.getUniformLocation(program, 'u_image'), 0)

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)

    // Read back result
    const result = new Uint8Array(imageData.width * imageData.height * 4)
    this.gl.readPixels(0, 0, imageData.width, imageData.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, result)

    // Convert to grayscale array
    const grayscale = new Uint8ClampedArray(imageData.width * imageData.height)
    for (let i = 0; i < result.length; i += 4) {
      grayscale[i / 4] = result[i] // R channel contains grayscale value
    }

    // Cleanup
    this.gl.deleteTexture(inputTexture)
    this.gl.deleteTexture(outputTexture)
    this.gl.deleteFramebuffer(framebuffer)
    this.gl.deleteBuffer(positionBuffer)
    this.gl.deleteBuffer(texCoordBuffer)
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

    return grayscale
  }

  dispose() {
    if (!this.gl) return

    // Clean up programs
    this.programs.forEach(program => this.gl!.deleteProgram(program))
    this.programs.clear()

    // Clean up textures
    this.textures.forEach(texture => this.gl!.deleteTexture(texture))
    this.textures.clear()

    // Clean up framebuffers
    this.framebuffers.forEach(framebuffer => this.gl!.deleteFramebuffer(framebuffer))
    this.framebuffers.clear()

    this.gl = null
    this.canvas = null
  }
}

// WebGL processor instance
let webglProcessor: WebGLProcessor | null = null

// Cleanup function
const cleanup = () => {
  if (processingTimeout) {
    clearTimeout(processingTimeout)
    processingTimeout = undefined
  }
  frameBuffer.length = 0
  results.length = 0
  isProcessing = false

  // Dispose WebGL resources
  if (webglProcessor) {
    webglProcessor.dispose()
    webglProcessor = null
  }
}

// Send message to main thread
const sendMessage = (message: SceneChangeWorkerMessage) => {
  self.postMessage(message)
}


// Process a single frame for scene change detection
const processFrameForSceneChange = (frameData: ImageData | ImageBitmap, timestamp: number): SceneChangeResult | null => {
  console.log(`🎬 [DEBUG] Scene detection algorithm started for frame at ${timestamp.toFixed(2)}s`)
  const startTime = performance.now()

  try {
    // Convert to ImageData if needed
    let imageData: ImageData
    if (frameData instanceof ImageBitmap) {
      const canvas = new OffscreenCanvas(frameData.width, frameData.height)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')
      ctx.drawImage(frameData, 0, 0)
      imageData = ctx.getImageData(0, 0, frameData.width, frameData.height)
    } else {
      imageData = frameData
    }

    // Downsample for performance
    const downsampled = downsampleImageData(imageData, config.performance.downsampleTo.width, config.performance.downsampleTo.height)
    console.log(`🎬 [DEBUG] Processing frame: ${imageData.width}x${imageData.height} → ${downsampled.width}x${downsampled.height}`)

    // Convert to grayscale first
    let grayscaleData: Uint8ClampedArray
    if (webglProcessor && config.performance.useWebGL) {
      const gpuResult = webglProcessor.convertToGrayscaleGPU(downsampled)
      if (gpuResult) {
        grayscaleData = gpuResult
      } else {
        // Fallback to CPU if GPU conversion fails
        console.warn('GPU grayscale conversion failed, falling back to CPU')
        grayscaleData = rgbToGrayscale(downsampled)
      }
    } else {
      grayscaleData = rgbToGrayscale(downsampled)
    }

    // Apply edge detection instead of just noise reduction
    const blurredData = applyGaussianBlur(grayscaleData, config.performance.downsampleTo.width, config.performance.downsampleTo.height)
    const edgeData = applySobelEdgeDetection(blurredData, config.performance.downsampleTo.width, config.performance.downsampleTo.height)
    const processedEdgeData = applyMorphologicalOps(edgeData, config.performance.downsampleTo.width, config.performance.downsampleTo.height)

    // Add to frame buffer
    const bufferedFrame: BufferedFrame = {
      data: downsampled,
      timestamp,
      edgeData: processedEdgeData
    }

    frameBuffer.push(bufferedFrame)
    console.log(`🎬 [DEBUG] Frame added to buffer (${frameBuffer.length}/${config.performance.maxFrameBuffer})`)

    // Limit buffer size
    if (frameBuffer.length > config.performance.maxFrameBuffer) {
      frameBuffer.shift()
    }

    // Need at least 2 frames for comparison
    if (frameBuffer.length < 2) {
      console.log(`🎬 [DEBUG] Not enough frames in buffer (${frameBuffer.length}), waiting for more...`)
      return null
    }

    // Apply temporal smoothing using edge difference
    let changePercentage = 0
    const smoothingFrames = Math.min(config.noiseReduction.temporalSmoothing, frameBuffer.length - 1)
    console.log(`🎬 [DEBUG] Starting edge comparison between ${smoothingFrames} frame pairs`)

    for (let i = 1; i <= smoothingFrames; i++) {
      const currentFrame = frameBuffer[frameBuffer.length - i]
      const previousFrame = frameBuffer[frameBuffer.length - i - 1]
      changePercentage += calculateEdgeDifference(previousFrame.edgeData, currentFrame.edgeData)
    }

    changePercentage /= smoothingFrames
    console.log(`🎬 [DEBUG] Edge change analysis: ${changePercentage.toFixed(3)}% average change`)

    // Calculate motion vectors (using edge data)
    const currentFrame = frameBuffer[frameBuffer.length - 1]
    const previousFrame = frameBuffer[frameBuffer.length - 2]
    const motionVectors = calculateMotionVectors(
      previousFrame.edgeData,
      currentFrame.edgeData,
      config.performance.downsampleTo.width,
      config.performance.downsampleTo.height
    )

    const level = classifyChangeLevel(changePercentage)
    console.log(`🎬 [DEBUG] Classified as: ${level} (stable:≤1%, moderate:1-3%, significant:3-5%, transition:>5%)`)
    const processingTime = performance.now() - startTime

    const result: SceneChangeResult = {
      id: `scene-${Date.now()}-${Math.random()}`,
      time: timestamp,
      changePercentage,
      level,
      motionVectors,
      metadata: {
        thresholdUsed: config.threshold[level],
        processingTime,
        frameCount: frameBuffer.length
      }
    }

    console.log(`🎬 [DEBUG] Frame processing completed in ${(performance.now() - startTime).toFixed(2)}ms`)
    return result

  } catch (error) {
    console.error('🎬 [DEBUG] Scene change detection processing failed:', error)
    return null
  }
}

// Handle start message
const handleStartSceneDetection = (message: StartSceneDetectionMessage) => {
  console.log(`🎬 [DEBUG] Scene detection started for ${message.payload.duration}s video`)
  cleanup()

  // Merge provided config with defaults, ensuring performance settings are preserved
  config = {
    ...DEFAULT_SCENE_CONFIG,
    ...message.payload.config,
    performance: {
      ...DEFAULT_SCENE_CONFIG.performance,
      ...message.payload.config?.performance
    }
  }

  // Initialize WebGL if requested and available
  if (config.performance.useWebGL) {
    webglProcessor = new WebGLProcessor()
    const webglInitialized = webglProcessor.initialize(
      config.performance.downsampleTo.width,
      config.performance.downsampleTo.height
    )

    if (webglInitialized) {
      // WebGL initialized successfully
    } else {
      config.performance.useWebGL = false
    }
  }

  // Set up completion timeout
  const completionTimeout = message.payload.duration * 1000 + 5000
  processingTimeout = self.setTimeout(() => {
    cleanup()
    const complete: SceneChangeStreamComplete = { type: 'sceneComplete', results: results.slice() }
    sendMessage(complete)
  }, completionTimeout)
}

// Handle process frame message
const handleProcessSceneFrame = (message: ProcessSceneFrameMessage) => {
  if (isProcessing) {
    console.log(`🎬 [DEBUG] Skipping frame processing - already processing`)
    return
  }

  isProcessing = true

  try {
    console.log(`🎬 [DEBUG] Processing frame at ${message.payload.timestamp.toFixed(2)}s`)
    const result = processFrameForSceneChange(message.payload.frameData, message.payload.timestamp)

    if (result) {
      results.push(result)
      const chunk: SceneChangeStreamChunk = { type: 'sceneChunk', result }
      sendMessage(chunk)

      console.log(`🎬 [1/5] Edge-based scene change detected: ${result.level} at ${result.time.toFixed(2)}s (${result.changePercentage.toFixed(3)}% edge change)`)
    } else {
      console.log(`🎬 [DEBUG] No scene change detected for frame at ${message.payload.timestamp.toFixed(2)}s`)
    }
  } catch (error) {
    console.error(`🎬 [DEBUG] Frame processing error:`, error)
    sendMessage({ type: 'sceneError', error: `Frame processing failed: ${error}` })
  } finally {
    isProcessing = false
  }
}

// Message handler
self.onmessage = (event: MessageEvent<IncomingSceneMessage>) => {
  const { data } = event

  console.log(`🎬 [DEBUG] Worker received message: ${data.type}`)

  if (data.type === 'startSceneDetection') {
    handleStartSceneDetection(data)
  } else if (data.type === 'processSceneFrame') {
    handleProcessSceneFrame(data)
  } else if (data.type === 'terminateSceneDetection') {
    cleanup()
  } else {
    console.log(`🎬 [DEBUG] Unknown message type: ${data.type}`)
  }
}

// Cleanup on worker termination
self.addEventListener('beforeunload', cleanup)

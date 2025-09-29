/**
 * Face detector with GPU delegation and WASM SIMD/threads fallback
 */

import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

export type DetectorBackend = 'webgpu' | 'webgl' | 'wasm_simd' | 'wasm' | 'cpu'

export interface DetectorOptions {
  /** Preferred backend, will fallback to less performant options if unavailable */
  prefer?: DetectorBackend
  /** Minimum detection confidence */
  minDetectionConfidence?: number
  /** Maximum number of results to return */
  maxResults?: number
  /** Minimum suppression threshold */
  minSuppressionThreshold?: number
}

export interface DetectorCapabilities {
  /** Available backends in order of preference */
  availableBackends: DetectorBackend[]
  /** Recommended backend based on hardware capabilities */
  recommendedBackend: DetectorBackend
  /** Whether cross-origin isolation is enabled (required for threads) */
  crossOriginIsolated: boolean
}

export class FaceDetectorManager {
  private detector: FaceDetector | null = null
  private currentBackend: DetectorBackend | null = null
  private vision: any = null

  /**
   * Get detector capabilities based on current browser environment
   */
  static async getCapabilities(): Promise<DetectorCapabilities> {
    const availableBackends: DetectorBackend[] = []

    // Check cross-origin isolation (required for WASM threads)
    const crossOriginIsolated = (navigator as any).crossOriginIsolated || false

    // Check WebGL support
    let webGLSupported = false
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      webGLSupported = !!gl
    } catch (e) {
      // WebGL not supported
    }

    // Check WebGPU support (future-proofing)
    let webGPUSupported = false
    try {
      // @ts-ignore - WebGPU is experimental
      webGPUSupported = !!(navigator.gpu)
    } catch (e) {
      // WebGPU not supported
    }

    // Check WASM SIMD support
    let wasmSimdSupported = false
    try {
      const wasmBuffer = new ArrayBuffer(4)
      const wasmView = new Uint8Array(wasmBuffer)
      wasmView[0] = 0x00
      wasmView[1] = 0x61
      wasmView[2] = 0x73
      wasmView[3] = 0x6d
      // This is a minimal SIMD test - in practice we'd check for actual SIMD features
      wasmSimdSupported = typeof WebAssembly !== 'undefined'
    } catch (e) {
      // WASM SIMD not supported
    }

    // Always have CPU as fallback
    availableBackends.push('cpu')

    // Add WASM if basic WebAssembly is supported
    if (typeof WebAssembly !== 'undefined') {
      availableBackends.push('wasm')

      // Add WASM SIMD if supported and cross-origin isolated (for threads)
      if (wasmSimdSupported) {
        if (crossOriginIsolated) {
          availableBackends.push('wasm_simd')
        }
      }
    }

    // Add WebGL if supported
    if (webGLSupported) {
      availableBackends.push('webgl')
    }

    // Add WebGPU if supported (future)
    if (webGPUSupported) {
      availableBackends.push('webgpu')
    }

    // Determine recommended backend (prefer GPU, then WASM SIMD, then WASM, then CPU)
    let recommendedBackend: DetectorBackend = 'cpu'
    if (webGPUSupported) {
      recommendedBackend = 'webgpu'
    } else if (webGLSupported) {
      recommendedBackend = 'webgl'
    } else if (wasmSimdSupported && crossOriginIsolated) {
      recommendedBackend = 'wasm_simd'
    } else if (typeof WebAssembly !== 'undefined') {
      recommendedBackend = 'wasm'
    }

    return {
      availableBackends,
      recommendedBackend,
      crossOriginIsolated
    }
  }

  /**
   * Initialize detector with the best available backend
   */
  async initialize(options: DetectorOptions = {}): Promise<DetectorBackend> {
    const {
      prefer = 'webgl',
      minDetectionConfidence = 0.5,
      maxResults = 5,
      minSuppressionThreshold = 0.5
    } = options

    const capabilities = await FaceDetectorManager.getCapabilities()

    // Determine backend priority based on preference and availability
    const backendPriority: DetectorBackend[] = []

    // Add preferred backend first if available
    if (capabilities.availableBackends.includes(prefer)) {
      backendPriority.push(prefer)
    }

    // Add all other available backends in order of preference
    const remainingBackends: DetectorBackend[] = ['webgpu', 'webgl', 'wasm_simd', 'wasm', 'cpu']
    for (const backend of remainingBackends) {
      if (capabilities.availableBackends.includes(backend) && backend !== prefer) {
        backendPriority.push(backend)
      }
    }

    // Try to initialize with each backend in priority order
    for (const backend of backendPriority) {
      try {
        await this.initializeWithBackend(backend, {
          minDetectionConfidence,
          minSuppressionThreshold
        })
        this.currentBackend = backend
        return backend
      } catch (error) {
        console.warn(`Failed to initialize face detector with backend ${backend}:`, error)
        // Continue to next backend
      }
    }

    throw new Error('Failed to initialize face detector with any available backend')
  }

  /**
   * Initialize detector with a specific backend
   */
  private async initializeWithBackend(
    backend: DetectorBackend,
    options: {
      minDetectionConfidence: number
      minSuppressionThreshold: number
    }
  ): Promise<void> {
    // Clean up existing detector
    if (this.detector) {
      this.detector.close()
      this.detector = null
    }

    // Initialize vision if not already done
    if (!this.vision) {
      this.vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      )
    }

    // Map backend to MediaPipe delegate
    let delegate: 'CPU' | 'GPU' = 'CPU'
    let modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'

    switch (backend) {
      case 'webgpu':
      case 'webgl':
        delegate = 'GPU'
        // Use GPU-optimized model if available
        modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
        break
      case 'wasm_simd':
      case 'wasm':
        delegate = 'CPU' // MediaPipe handles WASM delegation internally
        break
      case 'cpu':
        delegate = 'CPU'
        break
    }

    this.detector = await FaceDetector.createFromOptions(this.vision, {
      baseOptions: {
        modelAssetPath,
        delegate
      },
      minDetectionConfidence: options.minDetectionConfidence,
      minSuppressionThreshold: options.minSuppressionThreshold
      // Note: maxResults is not available in MediaPipe FaceDetector options
    })
  }

  /**
   * Detect faces in an image
   */
  detect(imageData: ImageData): any {
    if (!this.detector) {
      throw new Error('Detector not initialized')
    }

    return this.detector.detect(imageData)
  }

  /**
   * Get current backend
   */
  getCurrentBackend(): DetectorBackend | null {
    return this.currentBackend
  }

  /**
   * Close detector and free resources
   */
  close(): void {
    if (this.detector) {
      this.detector.close()
      this.detector = null
    }
    this.currentBackend = null
  }
}

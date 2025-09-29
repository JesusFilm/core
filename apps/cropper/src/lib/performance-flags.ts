/**
 * Performance feature flags and capability detection for the auto-crop pipeline
 */

/**
 * Detect WebCodecs VideoDecoder support
 */
function detectWebCodecsSupport(): boolean {
  return typeof VideoDecoder !== 'undefined'
}

/**
 * Detect WebCodecs VideoEncoder support
 */
function detectVideoEncoderSupport(): boolean {
  return typeof VideoEncoder !== 'undefined'
}

/**
 * Detect WebGL support for GPU delegation
 */
function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return gl !== null
  } catch {
    return false
  }
}

/**
 * Detect WebGPU support (future-proofing)
 */
function detectWebGPUSupport(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

/**
 * Detect WASM SIMD support
 */
function detectWASMSIMDSupport(): boolean {
  try {
    // Test SIMD support by trying to validate a SIMD module
    return WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0,
      10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11
    ]))
  } catch {
    return false
  }
}

/**
 * Detect WASM threads support
 */
function detectWASMThreadsSupport(): boolean {
  try {
    // Test threads support by trying to validate a shared memory module
    return WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0,
      5, 4, 1, 0, 0, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11
    ]))
  } catch {
    return false
  }
}

/**
 * Check if cross-origin isolation is enabled
 */
function isCrossOriginIsolated(): boolean {
  return typeof navigator !== 'undefined' && navigator.crossOriginIsolated === true
}

/**
 * Get performance feature flags based on runtime capabilities
 */
export function getPerformanceFeatureFlags(): Record<string, boolean> {
  // Check capabilities (safe to call in SSR context due to typeof checks)
  const webCodecsSupported = detectWebCodecsSupport()
  const videoEncoderSupported = detectVideoEncoderSupport()
  const webGLSupported = detectWebGLSupport()
  const webGPUSupported = detectWebGPUSupport()
  const wasmSimdSupported = detectWASMSIMDSupport()
  const wasmThreadsSupported = detectWASMThreadsSupport()
  const crossOriginIsolated = isCrossOriginIsolated()

  // Enable GPU delegate if WebGL/WebGPU is available
  const gpuDelegateSupported = webGLSupported || webGPUSupported

  // WebCodecs requires cross-origin isolation for threads
  const webCodecsSafe = webCodecsSupported && crossOriginIsolated

  return {
    // Performance optimization flags (enabled by default if supported)
    'perf.webcodecs_decode': webCodecsSafe,
    'perf.gpu_delegate': gpuDelegateSupported,
    'perf.videoencoder': videoEncoderSupported,

    // Capability detection flags (read-only indicators)
    'cap.webcodecs': webCodecsSupported,
    'cap.webgl': webGLSupported,
    'cap.webgpu': webGPUSupported,
    'cap.wasm_simd': wasmSimdSupported,
    'cap.wasm_threads': wasmThreadsSupported,
    'cap.cross_origin_isolated': crossOriginIsolated,

    // Legacy flags for backward compatibility
    'perf.webgl': webGLSupported,
    'perf.wasm_simd': wasmSimdSupported,
    'perf.wasm_threads': wasmThreadsSupported
  }
}

/**
 * Runtime capability checks for conditional logic
 */
export const capabilities = {
  get webCodecs() { return detectWebCodecsSupport() },
  get videoEncoder() { return detectVideoEncoderSupport() },
  get webGL() { return detectWebGLSupport() },
  get webGPU() { return detectWebGPUSupport() },
  get wasmSIMD() { return detectWASMSIMDSupport() },
  get wasmThreads() { return detectWASMThreadsSupport() },
  get crossOriginIsolated() { return isCrossOriginIsolated() }
}

/**
 * Check if all prerequisites for advanced optimizations are met
 */
export function checkPrerequisites(): {
  ready: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []

  if (!capabilities.crossOriginIsolated) {
    missing.push('Cross-Origin Isolation (COOP/COEP headers)')
  }

  if (!capabilities.webCodecs) {
    warnings.push('WebCodecs not supported - will fall back to video element decoding')
  }

  if (!capabilities.webGL && !capabilities.webGPU) {
    warnings.push('No GPU acceleration available - face detection will use CPU')
  }

  if (!capabilities.wasmSIMD) {
    warnings.push('WASM SIMD not supported - MediaPipe may run slower')
  }

  if (!capabilities.wasmThreads) {
    warnings.push('WASM threads not supported - MediaPipe will be single-threaded')
  }

  return {
    ready: missing.length === 0,
    missing,
    warnings
  }
}

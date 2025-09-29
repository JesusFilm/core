import { useFlags } from '@core/shared/ui/FlagsProvider'

/**
 * Hook to access performance feature flags and capabilities
 */
export function usePerformanceFlags() {
  const flags = useFlags()

  return {
    // Performance optimization flags
    webCodecsDecode: flags['perf.webcodecs_decode'] ?? false,
    gpuDelegate: flags['perf.gpu_delegate'] ?? false,
    videoEncoder: flags['perf.videoencoder'] ?? false,

    // Legacy flags for backward compatibility
    webGL: flags['perf.webgl'] ?? false,
    wasmSIMD: flags['perf.wasm_simd'] ?? false,
    wasmThreads: flags['perf.wasm_threads'] ?? false,

    // Capability indicators
    capabilities: {
      webCodecs: flags['cap.webcodecs'] ?? false,
      webGL: flags['cap.webgl'] ?? false,
      webGPU: flags['cap.webgpu'] ?? false,
      wasmSIMD: flags['cap.wasm_simd'] ?? false,
      wasmThreads: flags['cap.wasm_threads'] ?? false,
      crossOriginIsolated: flags['cap.cross_origin_isolated'] ?? false
    },

    // All raw flags for debugging
    raw: flags
  }
}

/**
 * Hook to check if performance optimizations can be enabled
 */
export function usePerformanceOptimizations() {
  const flags = usePerformanceFlags()

  return {
    canUseWebCodecs: flags.webCodecsDecode && flags.capabilities.crossOriginIsolated,
    canUseGPU: flags.gpuDelegate,
    canUseVideoEncoder: flags.videoEncoder,
    canUseWASMThreads: flags.capabilities.wasmThreads && flags.capabilities.crossOriginIsolated,
    canUseWASMSIMD: flags.capabilities.wasmSIMD,

    // Summary status
    optimizationsAvailable: flags.capabilities.crossOriginIsolated,
    gpuAcceleration: flags.capabilities.webGL || flags.capabilities.webGPU,
    advancedWASM: flags.capabilities.wasmSIMD || flags.capabilities.wasmThreads
  }
}

/**
 * Analysis pass implementation for auto-crop pipeline
 * Orchestrates probing, shot detection, and face analysis into cohesive pipeline
 */

import type {
  AnalysisResult,
  PipelineConfig,
  PipelineProgress
} from '../types/pipeline'
import type { VideoMetadata } from '../types/video-metadata'
import type { SceneDetectionResults } from '../types/scene-detection'
import type { FaceTrackingResults } from '../types/face-tracking'

import { probeVideoMeta } from './probe'
import { detectShots, detectShotsFromVideoStream, detectShotsFromVideoStreamGated } from './scene-detection'
import { analyzeFacesInVideo, analyzeFacesInVideoStream } from './face-analysis'
import { generateVirtualCameraPath, type PathGenerationInput } from './virtual-camera'
import { globalProfiler } from './profiler'
import { createDecodeSession, createFrameStream, isWebCodecsSupported } from './decoding/decode-manager'

/**
 * Run complete analysis pass on a video
 * This is the first pass of the two-pass auto-crop pipeline
 */
export async function runAnalysisPass(
  videoInput: HTMLVideoElement | string,
  config: PipelineConfig,
  onProgress?: (progress: PipelineProgress) => void,
  onError?: (error: PipelineError) => void
): Promise<AnalysisResult> {
  const startTime = performance.now()
  let currentStage: PipelineProgress['stage'] = 'probing'

  // Start profiling session
  const videoId = typeof videoInput === 'string' ? videoInput : 'html-video-element'
  const sessionId = globalProfiler.startSession(videoId, {
    parameters: config,
    flags: {
      perf_webcodecs_decode: false, // Will be enabled in future stages
      perf_gpu_delegate: false, // Will be enabled in future stages
      perf_videoencoder: false // Will be enabled in future stages
    }
  })

  try {
    // Stage 1: Probe video metadata
    const probingMeasurementId = globalProfiler.startMeasurement('probing_metadata')
    onProgress?.({
      stage: currentStage,
      stageProgress: 0,
      overallProgress: 0,
      eta: undefined
    })

    const metadata = await probeVideoMeta(videoInput, {
      timeoutMs: config.probing.timeoutSeconds * 1000,
      detailedCodecInfo: config.probing.detailedCodecInfo
    })

    globalProfiler.endMeasurement(probingMeasurementId)
    onProgress?.({
      stage: currentStage,
      stageProgress: 100,
      overallProgress: 20,
      eta: undefined
    })

    // Validate metadata
    if (metadata.duration <= 0 || metadata.width <= 0 || metadata.height <= 0) {
      throw new PipelineError('probing', 'Invalid video metadata', 'metadata_extraction_error', false)
    }

    // Stage 2: Shot boundary detection
    currentStage = 'shot_detection'
    const shotDetectionMeasurementId = globalProfiler.startMeasurement('shot_detection', { totalFrames: Math.floor(metadata.duration * metadata.fps) })
    onProgress?.({
      stage: currentStage,
      stageProgress: 0,
      overallProgress: 20,
      eta: undefined
    })

    let shotResults: SceneDetectionResults
    let videoElement: HTMLVideoElement | undefined

    // Check if WebCodecs is enabled and supported for shot detection
    const useWebCodecsForShots = config.perf?.webcodecs_decode && isWebCodecsSupported()

    // Check if histogram gating is enabled
    const useHistogramGating = config.shotDetection.thresholds.gating !== undefined

    if (useWebCodecsForShots) {
      // WebCodecs path - decode and detect shots in stream
      const decodeSessionId = await createDecodeSession({
        src: typeof videoInput === 'string' ? videoInput : videoInput.src,
        startTime: 0,
        endTime: metadata.duration,
        onMetadata: (decodeMetadata) => {
          // Update metadata if needed
          console.log('[AnalysisPass] Decode metadata for shots:', decodeMetadata)
        },
        onError: (error) => {
          console.error('[AnalysisPass] Decode error for shots:', error)
          throw error
        }
      })

      const frameStream = createFrameStream(decodeSessionId)

      // Use histogram-gated detection if enabled, otherwise use regular detection
      if (useHistogramGating) {
        shotResults = await detectShotsFromVideoStreamGated(
          frameStream,
          metadata,
          config.shotDetection,
          (progress) => {
            const stageProgress = (progress.frame / progress.totalFrames) * 100
            const overallProgress = 20 + (stageProgress * 0.3) // 20-50% for shot detection
            onProgress?.({
              stage: currentStage,
              stageProgress,
              overallProgress,
              currentFrame: progress.frame,
              totalFrames: progress.totalFrames,
              eta: undefined
            })
          }
        )
      } else {
        shotResults = await detectShotsFromVideoStream(
          frameStream,
          metadata,
          config.shotDetection,
          (progress) => {
            const stageProgress = (progress.frame / progress.totalFrames) * 100
            const overallProgress = 20 + (stageProgress * 0.3) // 20-50% for shot detection
            onProgress?.({
              stage: currentStage,
              stageProgress,
              overallProgress,
              currentFrame: progress.frame,
              totalFrames: progress.totalFrames,
              eta: undefined
            })
          }
        )
      }
    } else {
      // Legacy path - use video element seeking
      videoElement = typeof videoInput === 'string'
        ? await createVideoElement(videoInput)
        : videoInput

      shotResults = await detectShots(
        videoElement,
        metadata,
        config.shotDetection,
        (progress) => {
          const stageProgress = (progress.frame / progress.totalFrames) * 100
          const overallProgress = 20 + (stageProgress * 0.3) // 20-50% for shot detection
          onProgress?.({
            stage: currentStage,
            stageProgress,
            overallProgress,
            currentFrame: progress.frame,
            totalFrames: progress.totalFrames,
            eta: undefined
          })
        }
      )
    }

    globalProfiler.endMeasurement(shotDetectionMeasurementId)
    onProgress?.({
      stage: currentStage,
      stageProgress: 100,
      overallProgress: 50,
      eta: undefined
    })

    // Stage 3: Face analysis
    currentStage = 'face_analysis'
    const faceAnalysisMeasurementId = globalProfiler.startMeasurement('face_analysis', { totalFrames: Math.floor(metadata.duration * metadata.fps) })
    onProgress?.({
      stage: currentStage,
      stageProgress: 0,
      overallProgress: 50,
      eta: undefined
    })

    let faceResults: FaceTrackingResults

    // Check if WebCodecs is enabled and supported
    const useWebCodecs = config.perf?.webcodecs_decode && isWebCodecsSupported()

    if (useWebCodecs) {
      // WebCodecs path - decode and analyze in stream
      const decodeSessionId = await createDecodeSession({
        src: typeof videoInput === 'string' ? videoInput : videoInput.src,
        startTime: 0,
        endTime: metadata.duration,
        onMetadata: (decodeMetadata) => {
          // Update metadata if needed
          console.log('[AnalysisPass] Decode metadata:', decodeMetadata)
        },
        onError: (error) => {
          console.error('[AnalysisPass] Decode error:', error)
          throw error
        }
      })

      const frameStream = createFrameStream(decodeSessionId)

      faceResults = await analyzeFacesInVideoStream(
        frameStream,
        metadata,
        shotResults.shots,
        config.faceTracking,
        (progress) => {
          const stageProgress = (progress.frame / progress.totalFrames) * 100
          const overallProgress = 50 + (stageProgress * 0.4) // 50-90% for face analysis
          onProgress?.({
            stage: currentStage,
            stageProgress,
            overallProgress,
            currentFrame: progress.frame,
            totalFrames: progress.totalFrames,
            eta: undefined
          })
        }
      )
    } else {
      // Legacy path - use video element seeking
      if (!videoElement) {
        videoElement = typeof videoInput === 'string'
          ? await createVideoElement(videoInput)
          : videoInput
      }
      faceResults = await analyzeFacesInVideo(
        videoElement,
        metadata,
        shotResults.shots,
        config.faceTracking,
        (progress) => {
          const stageProgress = (progress.frame / progress.totalFrames) * 100
          const overallProgress = 50 + (stageProgress * 0.4) // 50-90% for face analysis
          onProgress?.({
            stage: currentStage,
            stageProgress,
            overallProgress,
            currentFrame: progress.frame,
            totalFrames: progress.totalFrames,
            eta: undefined
          })
        }
      )
    }

    globalProfiler.endMeasurement(faceAnalysisMeasurementId)
    onProgress?.({
      stage: currentStage,
      stageProgress: 100,
      overallProgress: 90,
      eta: undefined
    })

    // Add tracking performance metadata to the measurement
    const faceAnalysisMeasurement = globalProfiler.getCurrentSession()?.measurements.find(m => m.name === 'face_analysis')
    if (faceAnalysisMeasurement) {
      faceAnalysisMeasurement.metadata = {
        ...faceAnalysisMeasurement.metadata,
        trackingStats: {
          totalDetections: faceResults.stats.totalDetections,
          totalTracks: faceResults.stats.totalTracks,
          avgDetectionsPerFrame: faceResults.stats.avgDetectionsPerFrame,
          primaryFaceSwitches: faceResults.stats.primaryFaceSwitches
        }
      }
    }

    // Stage 4: Generate virtual camera path
    currentStage = 'path_generation'
    const pathGenerationMeasurementId = globalProfiler.startMeasurement('path_generation', { faceCount: faceResults.tracks.length, shotCount: shotResults.shots.length })
    onProgress?.({
      stage: currentStage,
      stageProgress: 0,
      overallProgress: 90,
      eta: undefined
    })

    // Generate virtual camera path from face tracking results
    const pathInput: PathGenerationInput = {
      metadata,
      faceTracking: faceResults,
      shots: shotResults.shots,
      parameters: config.cameraPath
    }

    const cameraPath = generateVirtualCameraPath(pathInput, (progress) => {
      const stageProgress = (progress.frame / progress.totalFrames) * 100
      onProgress?.({
        stage: currentStage,
        stageProgress,
        overallProgress: 90 + (stageProgress * 0.1), // 90-100% for path generation
        currentFrame: progress.frame,
        totalFrames: progress.totalFrames,
        eta: undefined
      })
    })

    globalProfiler.endMeasurement(pathGenerationMeasurementId)

    // Set video ID
    cameraPath.videoId = typeof videoInput === 'string' ? videoInput : 'video-element'

    onProgress?.({
      stage: currentStage,
      stageProgress: 100,
      overallProgress: 100,
      eta: undefined
    })

    // Calculate final statistics
    const totalTime = performance.now() - startTime
    const totalFrames = Math.floor(metadata.duration * metadata.fps)
    const fps = totalFrames / (totalTime / 1000)

    // Clean up temporary video element
    if (typeof videoInput === 'string' && videoElement?.parentNode) {
      videoElement.parentNode.removeChild(videoElement)
    }

    const result: AnalysisResult = {
      metadata,
      shots: shotResults.shots,
      faceTracking: faceResults,
      cameraPath,
      stats: {
        totalTime,
        shotDetectionTime: shotResults.stats.processingTime,
        faceProcessingTime: faceResults.stats.totalDetections > 0 ?
          (totalTime * 0.4) : 0, // Estimate based on face analysis stage (50-90%)
        pathGenerationTime: cameraPath.metadata.stats?.totalProcessingTime || 0,
        fps
      }
    }

    // End profiling session
    globalProfiler.endSession(sessionId)

    return result

  } catch (error) {
    const pipelineError = error instanceof PipelineError
      ? error
      : new PipelineError(
          currentStage,
          error instanceof Error ? error.message : 'Unknown analysis error',
          'unknown_error',
          false
        )

    // End profiling session on error
    globalProfiler.endSession(sessionId)

    onError?.(pipelineError)
    throw pipelineError
  }
}

/**
 * Create a video element for analysis (used when input is a URL)
 */
async function createVideoElement(src: string): Promise<HTMLVideoElement> {
  const video = document.createElement('video')
  video.src = src
  video.preload = 'metadata'
  video.crossOrigin = 'anonymous'
  video.style.display = 'none'

  // Add to DOM temporarily for loading
  document.body.appendChild(video)

  return new Promise((resolve, reject) => {
    const onLoadedMetadata = () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('error', onError)
      resolve(video)
    }

    const onError = (event: Event) => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('error', onError)
      document.body.removeChild(video)
      reject(new Error('Failed to load video for analysis'))
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('error', onError)

    // Timeout
    setTimeout(() => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('error', onError)
      document.body.removeChild(video)
      reject(new Error('Video loading timeout'))
    }, 10000)

    video.load()
  })
}

/**
 * Pipeline error class
 */
class PipelineError extends Error {
  constructor(
    public stage: PipelineProgress['stage'],
    message: string,
    public type: string,
    public recoverable: boolean
  ) {
    super(message)
    this.name = 'PipelineError'
  }
}

/**
 * Utility function to run analysis with profiling
 */
export async function runAnalysisPassWithProfiling(
  videoInput: HTMLVideoElement | string,
  config: PipelineConfig,
  sessionId: string,
  profiling: any, // Would be the VideoProcessingProfiler instance
  onProgress?: (progress: PipelineProgress) => void,
  onError?: (error: PipelineError) => void
): Promise<AnalysisResult> {
  const videoId = typeof videoInput === 'string' ? videoInput : 'video-element'

  return profiling.profileAsync('analysis_pass', async () => {
    // Profile individual stages
    const result = await runAnalysisPass(videoInput, config, (progress) => {
      // Update profiling with current stage
      profiling.currentStage = progress.stage
      onProgress?.(progress)
    }, onError)

    return result
  })
}

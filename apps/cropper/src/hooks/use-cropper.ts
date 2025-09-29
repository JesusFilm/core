'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type {
  CropBox,
  CropKeyframe,
  CropPath,
  CropWindow,
  DetectionResult,
  Video,
  SceneChangeResult,
  SceneChangeConfig
} from '../types'
import type {
  VirtualCameraParameters,
  VirtualCameraPathWithOverrides,
  PathQAMetrics,
  AnalysisResult
} from '@core/shared/video-processing'
import {
  DEFAULT_VIRTUAL_CAMERA_PARAMS,
  DEFAULT_PIPELINE_CONFIG,
  analyzePathQA,
  runAnalysisPass,
  runRenderPass
} from '@core/shared/video-processing'
import {
  createCropKeyframe,
  createInitialPath,
  cropBoxAtTime,
  deleteKeyframe,
  mergeDetectionsIntoPath,
  replaceKeyframe,
  setKeyframes,
  adaptCropPathToSceneChange
} from '../lib/crop-engine'
import { interpolateKeyframes } from '../lib/interpolation'
import { runDetection, DetectionWorkerController } from '../lib/detection'
import { runSceneDetection, SceneDetectionWorkerController } from '../lib/scene-detection'
import { clampTime } from '../lib/video-utils'
import { getFrameRate } from '../config/frame-rate-config'

interface CropperState {
  video: Video | null
  htmlVideoElement: HTMLVideoElement | null
  path: CropPath | null
  activeKeyframeId: string | null
  currentTime: number
  detections: DetectionResult[]
  detectionStatus: 'idle' | 'running' | 'complete'
  detectionProgress: { current: number; total: number; percentage: number } | null
  detectorBackend: string | null
  detectorCapabilities: any | null
  sceneChanges: SceneChangeResult[]
  sceneDetectionStatus: 'idle' | 'running' | 'complete'
  autoTrackingEnabled: boolean
  sceneChangeDetectionEnabled: boolean
  lastSceneChangeLevel: 'stable' | 'moderate' | 'significant' | 'transition' | null
  // Auto-crop pipeline state
  virtualCameraParams: VirtualCameraParameters
  virtualCameraPath: VirtualCameraPathWithOverrides | null
  analysisResult: AnalysisResult | null
  qaMetrics: PathQAMetrics | null
  isAnalysisRunning: boolean
  isRenderRunning: boolean
  isQAAnalyzing: boolean
  analysisProgress: { stage: string; stageProgress: number; overallProgress: number; eta?: number } | null
  analysisError: string | null
  debugOverlayEnabled: boolean
}

type CropperAction =
  | { type: 'SET_VIDEO'; video: Video | null }
  | { type: 'SET_HTML_VIDEO_ELEMENT'; element: HTMLVideoElement | null }
  | { type: 'SET_TIME'; time: number }
  | { type: 'SET_ACTIVE_KEYFRAME'; keyframeId: string | null }
  | { type: 'ADD_KEYFRAME'; keyframe: CropKeyframe }
  | { type: 'UPDATE_KEYFRAME'; keyframe: CropKeyframe }
  | { type: 'REMOVE_KEYFRAME'; keyframeId: string }
  | { type: 'SET_PATH'; path: CropPath | null }
  | { type: 'PUSH_DETECTION'; detection: DetectionResult }
  | { type: 'SET_DETECTIONS'; detections: DetectionResult[] }
  | { type: 'MERGE_DETECTIONS' }
  | { type: 'SET_DETECTION_STATUS'; status: CropperState['detectionStatus'] }
  | { type: 'SET_DETECTION_PROGRESS'; progress: { current: number; total: number; percentage: number } | null }
  | { type: 'SET_DETECTOR_BACKEND'; backend: string; capabilities: any }
  | { type: 'TOGGLE_AUTO_TRACKING' }
  | { type: 'PUSH_SCENE_CHANGE'; sceneChange: SceneChangeResult }
  | { type: 'SET_SCENE_CHANGES'; sceneChanges: SceneChangeResult[] }
  | { type: 'SET_SCENE_DETECTION_STATUS'; status: CropperState['sceneDetectionStatus'] }
  | { type: 'TOGGLE_SCENE_CHANGE_DETECTION' }
  | { type: 'ADAPT_TO_SCENE_CHANGE'; sceneChange: SceneChangeResult }
  // Auto-crop actions
  | { type: 'SET_VIRTUAL_CAMERA_PARAMS'; params: VirtualCameraParameters }
  | { type: 'SET_VIRTUAL_CAMERA_PATH'; path: VirtualCameraPathWithOverrides | null }
  | { type: 'SET_ANALYSIS_RESULT'; result: AnalysisResult | null }
  | { type: 'SET_QA_METRICS'; metrics: PathQAMetrics | null }
  | { type: 'SET_ANALYSIS_RUNNING'; running: boolean }
  | { type: 'SET_RENDER_RUNNING'; running: boolean }
  | { type: 'SET_QA_ANALYZING'; analyzing: boolean }
  | { type: 'SET_ANALYSIS_PROGRESS'; progress: { stage: string; stageProgress: number; overallProgress: number; eta?: number } | null }
  | { type: 'SET_ANALYSIS_ERROR'; error: string | null }
  | { type: 'TOGGLE_DEBUG_OVERLAY' }

const INITIAL_STATE: CropperState = {
  video: null,
  htmlVideoElement: null,
  path: null,
  activeKeyframeId: null,
  currentTime: 0,
  detections: [],
  detectionStatus: 'idle',
  detectionProgress: null,
  detectorBackend: null,
  detectorCapabilities: null,
  sceneChanges: [],
  sceneDetectionStatus: 'idle',
  autoTrackingEnabled: false, // Disabled by default to prevent freezing
  sceneChangeDetectionEnabled: false, // Disabled by default to prevent freezing
  lastSceneChangeLevel: null,
  // Auto-crop initial state
  virtualCameraParams: DEFAULT_VIRTUAL_CAMERA_PARAMS,
  virtualCameraPath: null,
  analysisResult: null,
  qaMetrics: null,
  isAnalysisRunning: false,
  isRenderRunning: false,
  isQAAnalyzing: false,
  analysisProgress: null,
  analysisError: null,
  debugOverlayEnabled: false
}

function reducer(state: CropperState, action: CropperAction): CropperState {
  switch (action.type) {
    case 'SET_VIDEO': {
      if (!action.video) {
        return { ...INITIAL_STATE }
      }

      const path = createInitialPath(action.video)
      return {
        ...INITIAL_STATE,
        video: action.video,
        path,
        activeKeyframeId: path.keyframes[0]?.id ?? null
      }
    }

    case 'SET_HTML_VIDEO_ELEMENT': {
      return {
        ...state,
        htmlVideoElement: action.element
      }
    }

    case 'SET_TIME': {
      if (!state.video) {
        return state
      }

      return {
        ...state,
        currentTime: clampTime(action.time, state.video.duration)
      }
    }

    case 'SET_ACTIVE_KEYFRAME': {
      return {
        ...state,
        activeKeyframeId: action.keyframeId
      }
    }

    case 'ADD_KEYFRAME': {
      if (!state.path) {
        return state
      }

      const nextPath = setKeyframes(state.path, [...state.path.keyframes, action.keyframe])
      return {
        ...state,
        path: nextPath,
        activeKeyframeId: action.keyframe.id
      }
    }

    case 'UPDATE_KEYFRAME': {
      if (!state.path) {
        return state
      }

      const nextPath = replaceKeyframe(state.path, action.keyframe)
      return {
        ...state,
        path: nextPath,
        activeKeyframeId: action.keyframe.id
      }
    }

    case 'REMOVE_KEYFRAME': {
      if (!state.path) {
        return state
      }

      const nextPath = deleteKeyframe(state.path, action.keyframeId)
      const remaining = nextPath.keyframes
      const fallback = remaining.length > 0 ? remaining[Math.max(remaining.length - 1, 0)].id : null

      return {
        ...state,
        path: nextPath,
        activeKeyframeId: fallback
      }
    }

    case 'SET_PATH': {
      return {
        ...state,
        path: action.path
      }
    }

    case 'PUSH_DETECTION': {
      const detections = [...state.detections, action.detection].sort(
        (a, b) => a.time - b.time
      )

      return {
        ...state,
        detections
      }
    }

    case 'SET_DETECTIONS': {
      const detections = [...action.detections].sort((a, b) => a.time - b.time)

      return {
        ...state,
        detections
      }
    }

    case 'MERGE_DETECTIONS': {
      if (!state.path || state.detections.length === 0) {
        return state
      }

      const merged = mergeDetectionsIntoPath(state.detections, state.path)

      return {
        ...state,
        path: merged
      }
    }

    case 'SET_DETECTION_STATUS': {
      return {
        ...state,
        detectionStatus: action.status,
        detectionProgress: action.status === 'idle' ? null : state.detectionProgress
      }
    }

    case 'SET_DETECTION_PROGRESS': {
      return {
        ...state,
        detectionProgress: action.progress
      }
    }

    case 'SET_DETECTOR_BACKEND': {
      return {
        ...state,
        detectorBackend: action.backend,
        detectorCapabilities: action.capabilities
      }
    }

    case 'TOGGLE_AUTO_TRACKING': {
      const newAutoTrackingEnabled = !state.autoTrackingEnabled
      return {
        ...state,
        autoTrackingEnabled: newAutoTrackingEnabled
      }
    }

    case 'PUSH_SCENE_CHANGE': {
      const sceneChanges = [...state.sceneChanges, action.sceneChange].sort(
        (a, b) => a.time - b.time
      )

      return {
        ...state,
        sceneChanges,
        lastSceneChangeLevel: action.sceneChange.level
      }
    }

    case 'SET_SCENE_CHANGES': {
      const sceneChanges = [...action.sceneChanges].sort((a, b) => a.time - b.time)

      return {
        ...state,
        sceneChanges
      }
    }

    case 'SET_SCENE_DETECTION_STATUS': {
      return {
        ...state,
        sceneDetectionStatus: action.status
      }
    }

    case 'TOGGLE_SCENE_CHANGE_DETECTION': {
      const newSceneChangeDetectionEnabled = !state.sceneChangeDetectionEnabled
      return {
        ...state,
        sceneChangeDetectionEnabled: newSceneChangeDetectionEnabled
      }
    }

    case 'ADAPT_TO_SCENE_CHANGE': {
      if (!state.path) {
        return state
      }

      const adaptedPath = adaptCropPathToSceneChange(state.path, action.sceneChange, state.sceneChanges)

      return {
        ...state,
        path: adaptedPath,
        lastSceneChangeLevel: action.sceneChange.level
      }
    }

    // Auto-crop reducer cases
    case 'SET_VIRTUAL_CAMERA_PARAMS': {
      return {
        ...state,
        virtualCameraParams: action.params
      }
    }

    case 'SET_VIRTUAL_CAMERA_PATH': {
      return {
        ...state,
        virtualCameraPath: action.path
      }
    }

    case 'SET_ANALYSIS_RESULT': {
      return {
        ...state,
        analysisResult: action.result
      }
    }

    case 'SET_QA_METRICS': {
      return {
        ...state,
        qaMetrics: action.metrics
      }
    }

    case 'SET_ANALYSIS_RUNNING': {
      return {
        ...state,
        isAnalysisRunning: action.running
      }
    }

    case 'SET_RENDER_RUNNING': {
      return {
        ...state,
        isRenderRunning: action.running
      }
    }

    case 'SET_QA_ANALYZING': {
      return {
        ...state,
        isQAAnalyzing: action.analyzing
      }
    }

    case 'SET_ANALYSIS_PROGRESS': {
      return {
        ...state,
        analysisProgress: action.progress
      }
    }

    case 'SET_ANALYSIS_ERROR': {
      return {
        ...state,
        analysisError: action.error
      }
    }

    case 'TOGGLE_DEBUG_OVERLAY': {
      return {
        ...state,
        debugOverlayEnabled: !state.debugOverlayEnabled
      }
    }

    default:
      return state
  }
}

export interface UseCropperResult {
  video: Video | null
  htmlVideoElement: HTMLVideoElement | null
  path: CropPath | null
  keyframes: CropKeyframe[]
  currentCrop: CropBox | null
  currentTime: number
  activeKeyframe: CropKeyframe | null
  detectionStatus: CropperState['detectionStatus']
  detectionProgress: CropperState['detectionProgress']
  detectorBackend: string | null
  detectorCapabilities: any | null
  detections: DetectionResult[]
  sceneChanges: SceneChangeResult[]
  sceneDetectionStatus: CropperState['sceneDetectionStatus']
  autoTrackingEnabled: boolean
  sceneChangeDetectionEnabled: boolean
  lastSceneChangeLevel: CropperState['lastSceneChangeLevel']
  // Auto-crop fields
  virtualCameraParams: VirtualCameraParameters
  virtualCameraPath: VirtualCameraPathWithOverrides | null
  analysisResult: AnalysisResult | null
  qaMetrics: PathQAMetrics | null
  isAnalysisRunning: boolean
  isRenderRunning: boolean
  isQAAnalyzing: boolean
  analysisProgress: { stage: string; stageProgress: number; overallProgress: number; eta?: number } | null
  analysisError: string | null
  debugOverlayEnabled: boolean
  setVideo: (video: Video | null) => void
  setHtmlVideoElement: (element: HTMLVideoElement | null) => void
  setTime: (time: number) => void
  addKeyframeAt: (time: number, window?: Partial<CropWindow>) => void
  updateKeyframe: (keyframeId: string, patch: Partial<CropWindow> & { time?: number }) => void
  removeKeyframe: (keyframeId: string) => void
  selectKeyframe: (keyframeId: string | null) => void
  requestDetection: (videoElement?: HTMLVideoElement) => void
  requestSceneDetection: (videoElement?: HTMLVideoElement, config?: Partial<SceneChangeConfig>) => void
  pauseDetection: () => void
  resumeDetection: () => void
  pauseSceneDetection: () => void
  resumeSceneDetection: () => void
  toggleAutoTracking: () => void
  toggleSceneChangeDetection: () => void
  // Auto-crop functions
  setVirtualCameraParams: (params: VirtualCameraParameters) => void
  setVirtualCameraPath: (path: VirtualCameraPathWithOverrides | null) => void
  runAnalysisPass: () => Promise<void>
  runRenderPass: () => Promise<void>
  runQAAnalysis: () => Promise<void>
  toggleDebugOverlay: () => void
}

export function useCropper(): UseCropperResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const disposeDetectionRef = useRef<(() => void) | null>(null)
  const detectionControllerRef = useRef<DetectionWorkerController | null>(null)
  const disposeSceneDetectionRef = useRef<(() => void) | null>(null)
  const sceneDetectionControllerRef = useRef<SceneDetectionWorkerController | null>(null)

  const setVideo = useCallback((video: Video | null) => {
    // Clean up existing workers before setting new video
    disposeDetectionRef.current?.()
    disposeDetectionRef.current = null
    disposeSceneDetectionRef.current?.()
    disposeSceneDetectionRef.current = null
    detectionControllerRef.current = null
    sceneDetectionControllerRef.current = null

    dispatch({ type: 'SET_VIDEO', video })
  }, [])

  const setTime = useCallback((time: number) => {
    dispatch({ type: 'SET_TIME', time })
  }, [])

  const addKeyframeAt = useCallback(
    (time: number, window?: Partial<CropWindow>) => {
      const keyframe = createCropKeyframe(time, window)
      dispatch({ type: 'ADD_KEYFRAME', keyframe })
    },
    []
  )

  const updateKeyframe = useCallback((keyframeId: string, patch: Partial<CropWindow> & { time?: number }) => {
    if (!state.path) {
      return
    }

    const existing = state.path.keyframes.find((frame) => frame.id === keyframeId)
    if (!existing) {
      return
    }

    const updated: CropKeyframe = {
      ...existing,
      time: patch.time ?? existing.time,
      window: {
        focusX: patch.focusX ?? existing.window.focusX,
        focusY: patch.focusY ?? existing.window.focusY,
        scale: patch.scale ?? existing.window.scale
      },
      updatedAt: new Date().toISOString()
    }

    dispatch({ type: 'UPDATE_KEYFRAME', keyframe: updated })
  }, [state.path])

  const removeKeyframe = useCallback((keyframeId: string) => {
    dispatch({ type: 'REMOVE_KEYFRAME', keyframeId })
  }, [])

  const selectKeyframe = useCallback((keyframeId: string | null) => {
    dispatch({ type: 'SET_ACTIVE_KEYFRAME', keyframeId })
  }, [])

  const requestDetection = useCallback((videoElement?: HTMLVideoElement) => {
    if (!state.video) {
      return
    }

    dispatch({ type: 'SET_DETECTION_STATUS', status: 'running' })
    dispatch({ type: 'SET_DETECTIONS', detections: [] })

    disposeDetectionRef.current?.()

    const detectionOptions: any = {
      frameRate: getFrameRate('FACE_DETECTION')
    }

    // If we have a video element, use it directly instead of creating a new one
    if (videoElement) {
      detectionOptions.videoElement = videoElement
      detectionOptions.useExistingElement = true
    } else {
      // Fallback to URL-based detection (which may not work with HLS)
      detectionOptions.videoUrl = state.video.src
    }

    // Create controller and store reference
    const controller = new DetectionWorkerController()
    detectionControllerRef.current = controller

    const dispose = () => {
      controller.dispose()
      detectionControllerRef.current = null
    }

    controller.start(state.video.duration, {
      onChunk: (result) => {
        dispatch({ type: 'PUSH_DETECTION', detection: result })
      },
      onComplete: (results) => {
        dispatch({ type: 'SET_DETECTION_STATUS', status: 'complete' })
        dispatch({ type: 'SET_DETECTION_PROGRESS', progress: null })
        dispatch({ type: 'SET_DETECTIONS', detections: results })
        dispatch({ type: 'MERGE_DETECTIONS' })
      },
      onDetectorInfo: (backend, capabilities) => {
        dispatch({ type: 'SET_DETECTOR_BACKEND', backend, capabilities })
      },
      onError: (error) => {
        dispatch({ type: 'SET_DETECTION_STATUS', status: 'idle' })
        dispatch({ type: 'SET_DETECTION_PROGRESS', progress: null })
      },
      onProgress: (progress) => {
        dispatch({ type: 'SET_DETECTION_PROGRESS', progress })
      }
    }, detectionOptions)

    disposeDetectionRef.current = dispose
  }, [state.video])

  const toggleAutoTracking = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_TRACKING' })
  }, [])

  const toggleSceneChangeDetection = useCallback(() => {
    dispatch({ type: 'TOGGLE_SCENE_CHANGE_DETECTION' })
  }, [])

  const pauseDetection = useCallback(() => {
    if (detectionControllerRef.current) {
      detectionControllerRef.current.pauseExtraction()
    }
  }, [])

  const resumeDetection = useCallback(() => {
    if (detectionControllerRef.current) {
      detectionControllerRef.current.resumeExtraction()
    }
  }, [])

  const pauseSceneDetection = useCallback(() => {
    if (sceneDetectionControllerRef.current) {
      sceneDetectionControllerRef.current.pauseExtraction()
    }
  }, [])

  const resumeSceneDetection = useCallback(() => {
    if (sceneDetectionControllerRef.current) {
      sceneDetectionControllerRef.current.resumeExtraction()
    }
  }, [])

  const requestSceneDetection = useCallback((videoElement?: HTMLVideoElement, config?: Partial<SceneChangeConfig>) => {
    if (!state.video) {
      console.log(`🎬 [DEBUG] No video available, skipping scene detection`)
      return
    }

    dispatch({ type: 'SET_SCENE_DETECTION_STATUS', status: 'running' })
    dispatch({ type: 'SET_SCENE_CHANGES', sceneChanges: [] })

    disposeSceneDetectionRef.current?.()

    const sceneDetectionOptions = {
      config
    }

    // If we have a video element, use it directly instead of creating a new one
    if (videoElement) {
      sceneDetectionOptions.config = {
        ...config,
        performance: {
          downsampleTo: config?.performance?.downsampleTo || { width: 320, height: 180 },
          useWebGL: true, // Enable WebGL for better performance with video element
          maxFrameBuffer: config?.performance?.maxFrameBuffer || 5,
          ...config?.performance
        }
      }
    }

    // Create scene detection controller
    const sceneController = new SceneDetectionWorkerController()
    sceneDetectionControllerRef.current = sceneController

    const dispose = () => {
      sceneController.dispose()
      sceneDetectionControllerRef.current = null
    }

    sceneController.start(state.video.duration, {
      onChunk: (sceneChange) => {
        dispatch({ type: 'PUSH_SCENE_CHANGE', sceneChange })

        // Adapt crop path to scene change
        if (state.sceneChangeDetectionEnabled) {
          dispatch({ type: 'ADAPT_TO_SCENE_CHANGE', sceneChange })
        }
      },
      onComplete: (sceneChanges) => {
        dispatch({ type: 'SET_SCENE_DETECTION_STATUS', status: 'complete' })
        dispatch({ type: 'SET_SCENE_CHANGES', sceneChanges })
      },
      onError: (error) => {
        dispatch({ type: 'SET_SCENE_DETECTION_STATUS', status: 'idle' })
      }
    }, sceneDetectionOptions, videoElement)

    disposeSceneDetectionRef.current = dispose
  }, [state.video, state.sceneChangeDetectionEnabled])

  // Note: Auto-detection is now handled by CropWorkspace when checkbox is toggled

  useEffect(() => {
    return () => {
      disposeDetectionRef.current?.()
      disposeDetectionRef.current = null
      disposeSceneDetectionRef.current?.()
      disposeSceneDetectionRef.current = null
    }
  }, [])

  const currentCrop = useMemo(() => {
    if (!state.video || !state.path) {
      return null
    }

    try {
      return cropBoxAtTime(state.path, state.video, state.currentTime, interpolateKeyframes)
    } catch {
      return null
    }
  }, [state.video, state.path, state.currentTime])

  const activeKeyframe = useMemo(() => {
    if (!state.path || !state.activeKeyframeId) {
      return null
    }

    return state.path.keyframes.find((frame) => frame.id === state.activeKeyframeId) ?? null
  }, [state.path, state.activeKeyframeId])

  const keyframes = state.path ? state.path.keyframes : []

  return {
    video: state.video,
    htmlVideoElement: state.htmlVideoElement,
    path: state.path,
    keyframes,
    currentCrop,
    currentTime: state.currentTime,
    activeKeyframe,
    detectionStatus: state.detectionStatus,
    detectionProgress: state.detectionProgress,
    detectorBackend: state.detectorBackend,
    detectorCapabilities: state.detectorCapabilities,
    detections: state.detections,
    sceneChanges: state.sceneChanges,
    sceneDetectionStatus: state.sceneDetectionStatus,
    autoTrackingEnabled: state.autoTrackingEnabled,
    sceneChangeDetectionEnabled: state.sceneChangeDetectionEnabled,
    lastSceneChangeLevel: state.lastSceneChangeLevel,
    setVideo,
    setHtmlVideoElement: useCallback((element: HTMLVideoElement | null) => {
      dispatch({ type: 'SET_HTML_VIDEO_ELEMENT', element })
    }, []),
    setTime,
    addKeyframeAt,
    updateKeyframe,
    removeKeyframe,
    selectKeyframe,
    requestDetection,
    requestSceneDetection,
    pauseDetection,
    resumeDetection,
    pauseSceneDetection,
    resumeSceneDetection,
    toggleAutoTracking,
    toggleSceneChangeDetection,
    // Auto-crop functions
    virtualCameraParams: state.virtualCameraParams,
    virtualCameraPath: state.virtualCameraPath,
    analysisResult: state.analysisResult,
    qaMetrics: state.qaMetrics,
    isAnalysisRunning: state.isAnalysisRunning,
    isRenderRunning: state.isRenderRunning,
    isQAAnalyzing: state.isQAAnalyzing,
    analysisProgress: state.analysisProgress,
    analysisError: state.analysisError,
    debugOverlayEnabled: state.debugOverlayEnabled,
    setVirtualCameraParams: useCallback((params: VirtualCameraParameters) => {
      dispatch({ type: 'SET_VIRTUAL_CAMERA_PARAMS', params })
    }, []),
    setVirtualCameraPath: useCallback((path: VirtualCameraPathWithOverrides | null) => {
      dispatch({ type: 'SET_VIRTUAL_CAMERA_PATH', path })
    }, []),
    runAnalysisPass: useCallback(async () => {
      if (!state.htmlVideoElement) return

      // Ensure video is loaded and ready
      if (state.htmlVideoElement.readyState < 3) { // HAVE_FUTURE_DATA or better
        console.log('🎬 [ANALYSIS] Video not ready, waiting...')
        await new Promise((resolve) => {
          const onCanPlay = () => {
            state.htmlVideoElement?.removeEventListener('canplay', onCanPlay)
            resolve(void 0)
          }
          state.htmlVideoElement?.addEventListener('canplay', onCanPlay)

          // Timeout after 10 seconds
          setTimeout(() => {
            state.htmlVideoElement?.removeEventListener('canplay', onCanPlay)
            resolve(void 0)
          }, 10000)
        })
      }

      dispatch({ type: 'SET_ANALYSIS_RUNNING', running: true })
      dispatch({ type: 'SET_ANALYSIS_PROGRESS', progress: null })
      dispatch({ type: 'SET_ANALYSIS_ERROR', error: null })
      try {
        const pipelineConfig = {
          ...DEFAULT_PIPELINE_CONFIG,
          shotDetection: {
            ...DEFAULT_PIPELINE_CONFIG.shotDetection,
            step: 15 // Sample every 15 frames for faster processing
          },
          faceTracking: {
            ...DEFAULT_PIPELINE_CONFIG.faceTracking,
            detectorCadence: 15 // Run face detection every 15 frames for faster processing
          },
          cameraPath: state.virtualCameraParams
        }

        // Add timeout to prevent hanging
        const analysisPromise = runAnalysisPass(
          state.htmlVideoElement,
          pipelineConfig,
          (progress) => {
            console.log(`🎬 [ANALYSIS PROGRESS] ${progress.stage}: ${progress.stageProgress.toFixed(1)}% (overall: ${progress.overallProgress.toFixed(1)}%)`)
            dispatch({ type: 'SET_ANALYSIS_PROGRESS', progress })
          }
        )

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Analysis timeout after 5 minutes')), 5 * 60 * 1000)
        })

        const result = await Promise.race([analysisPromise, timeoutPromise])
        dispatch({ type: 'SET_ANALYSIS_RESULT', result })
        dispatch({ type: 'SET_VIRTUAL_CAMERA_PATH', path: result.cameraPath })
      } catch (error) {
        console.error('🎬 [ANALYSIS ERROR]', error)
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
        dispatch({ type: 'SET_ANALYSIS_ERROR', error: errorMessage })
      } finally {
        dispatch({ type: 'SET_ANALYSIS_RUNNING', running: false })
        dispatch({ type: 'SET_ANALYSIS_PROGRESS', progress: null })
      }
    }, [state.htmlVideoElement, state.virtualCameraParams]),
    runRenderPass: useCallback(async () => {
      if (!state.virtualCameraPath || !state.analysisResult || !state.htmlVideoElement) return

      dispatch({ type: 'SET_RENDER_RUNNING', running: true })
      try {
        const renderInput = {
          sourceVideo: state.htmlVideoElement.src || state.video?.src || '',
          cropPath: state.virtualCameraPath,
          config: {
            ...DEFAULT_PIPELINE_CONFIG.rendering,
            outputTarget: { width: 1080, height: 1920, fps: 30 },
            backgroundFill: 'blur' as const
          },
          metadata: state.analysisResult.metadata
        }

        await runRenderPass(renderInput)
      } finally {
        dispatch({ type: 'SET_RENDER_RUNNING', running: false })
      }
    }, [state.virtualCameraPath, state.analysisResult, state.htmlVideoElement]),
    runQAAnalysis: useCallback(async () => {
      if (!state.virtualCameraPath) return

      dispatch({ type: 'SET_QA_ANALYZING', analyzing: true })
      try {
        const metrics = analyzePathQA(
          state.virtualCameraPath,
          [], // face detections - would come from analysis result
          [], // shot boundaries - would come from analysis result
          { maxPanVelocityThreshold: 0.12, maxJitterThreshold: 0.05, minFaceAreaRatio: 0.3, maxCutoffsThreshold: 0 }
        )
        dispatch({ type: 'SET_QA_METRICS', metrics })
      } finally {
        dispatch({ type: 'SET_QA_ANALYZING', analyzing: false })
      }
    }, [state.virtualCameraPath]),
    toggleDebugOverlay: useCallback(() => {
      dispatch({ type: 'TOGGLE_DEBUG_OVERLAY' })
    }, [])
  }
}

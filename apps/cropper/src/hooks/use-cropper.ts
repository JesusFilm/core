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

interface CropperState {
  video: Video | null
  path: CropPath | null
  activeKeyframeId: string | null
  currentTime: number
  detections: DetectionResult[]
  detectionStatus: 'idle' | 'running' | 'complete'
  sceneChanges: SceneChangeResult[]
  sceneDetectionStatus: 'idle' | 'running' | 'complete'
  autoTrackingEnabled: boolean
  sceneChangeDetectionEnabled: boolean
  lastSceneChangeLevel: 'stable' | 'moderate' | 'significant' | 'transition' | null
}

type CropperAction =
  | { type: 'SET_VIDEO'; video: Video | null }
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
  | { type: 'TOGGLE_AUTO_TRACKING' }
  | { type: 'PUSH_SCENE_CHANGE'; sceneChange: SceneChangeResult }
  | { type: 'SET_SCENE_CHANGES'; sceneChanges: SceneChangeResult[] }
  | { type: 'SET_SCENE_DETECTION_STATUS'; status: CropperState['sceneDetectionStatus'] }
  | { type: 'TOGGLE_SCENE_CHANGE_DETECTION' }
  | { type: 'ADAPT_TO_SCENE_CHANGE'; sceneChange: SceneChangeResult }

const INITIAL_STATE: CropperState = {
  video: null,
  path: null,
  activeKeyframeId: null,
  currentTime: 0,
  detections: [],
  detectionStatus: 'idle',
  sceneChanges: [],
  sceneDetectionStatus: 'idle',
  autoTrackingEnabled: true,
  sceneChangeDetectionEnabled: true,
  lastSceneChangeLevel: null
}

function reducer(state: CropperState, action: CropperAction): CropperState {
  switch (action.type) {
    case 'SET_VIDEO': {
      if (!action.video) {
        return { ...INITIAL_STATE }
      }

      const path = createInitialPath(action.video)
      return {
        video: action.video,
        path,
        activeKeyframeId: path.keyframes[0]?.id ?? null,
        currentTime: 0,
        detections: [],
        detectionStatus: 'idle',
        sceneChanges: [],
        sceneDetectionStatus: 'idle',
        autoTrackingEnabled: true,
        sceneChangeDetectionEnabled: true,
        lastSceneChangeLevel: null
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
      if (!state.autoTrackingEnabled || !state.path || state.detections.length === 0) {
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
        detectionStatus: action.status
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

    default:
      return state
  }
}

export interface UseCropperResult {
  video: Video | null
  path: CropPath | null
  keyframes: CropKeyframe[]
  currentCrop: CropBox | null
  currentTime: number
  activeKeyframe: CropKeyframe | null
  detectionStatus: CropperState['detectionStatus']
  detections: DetectionResult[]
  sceneChanges: SceneChangeResult[]
  sceneDetectionStatus: CropperState['sceneDetectionStatus']
  autoTrackingEnabled: boolean
  sceneChangeDetectionEnabled: boolean
  lastSceneChangeLevel: CropperState['lastSceneChangeLevel']
  setVideo: (video: Video | null) => void
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
}

export function useCropper(): UseCropperResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const disposeDetectionRef = useRef<(() => void) | null>(null)
  const detectionControllerRef = useRef<DetectionWorkerController | null>(null)
  const disposeSceneDetectionRef = useRef<(() => void) | null>(null)
  const sceneDetectionControllerRef = useRef<SceneDetectionWorkerController | null>(null)
  const autoTrackingEnabledRef = useRef(state.autoTrackingEnabled)
  const sceneChangeDetectionEnabledRef = useRef(state.sceneChangeDetectionEnabled)

  useEffect(() => {
    autoTrackingEnabledRef.current = state.autoTrackingEnabled
  }, [state.autoTrackingEnabled])

  useEffect(() => {
    sceneChangeDetectionEnabledRef.current = state.sceneChangeDetectionEnabled
  }, [state.sceneChangeDetectionEnabled])

  const setVideo = useCallback((video: Video | null) => {
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
      frameRate: 2
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
        dispatch({ type: 'SET_DETECTIONS', detections: results })
        if (autoTrackingEnabledRef.current) {
          dispatch({ type: 'MERGE_DETECTIONS' })
        }
      },
      onError: (error) => {
        dispatch({ type: 'SET_DETECTION_STATUS', status: 'idle' })
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
    console.log(`🎬 [DEBUG] requestSceneDetection called for video: ${state.video?.slug}`)
    if (!state.video) {
      console.log(`🎬 [DEBUG] No video available, skipping scene detection`)
      return
    }

    console.log(`🎬 [DEBUG] Starting scene detection with video element: ${!!videoElement}`)
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
        ...(config?.performance
          ? {
              performance: {
                ...config.performance,
                useWebGL: true // Enable WebGL for better performance with video element
              }
            }
          : {})
      }
    }

    // Create scene detection controller
    const sceneController = new SceneDetectionWorkerController()
    sceneDetectionControllerRef.current = sceneController

    const dispose = () => {
      sceneController.dispose()
      sceneDetectionControllerRef.current = null
    }

    console.log(`🎬 [DEBUG] Starting scene detection controller with video element: ${!!videoElement}`)
    sceneController.start(state.video.duration, {
      onChunk: (sceneChange: SceneChangeResult) => {
        console.log(`🎬 [3/5] Hook dispatching edge-based scene change: ${sceneChange.level} (${sceneChange.changePercentage.toFixed(3)}% edge change)`)
        dispatch({ type: 'PUSH_SCENE_CHANGE', sceneChange })

        // Adapt crop path to scene change
        if (sceneChangeDetectionEnabledRef.current) {
          dispatch({ type: 'ADAPT_TO_SCENE_CHANGE', sceneChange })
        }
      },
      onComplete: (sceneChanges: SceneChangeResult[]) => {
        console.log(`🎬 [DEBUG] Scene detection completed with ${sceneChanges.length} changes`)
        dispatch({ type: 'SET_SCENE_DETECTION_STATUS', status: 'complete' })
        dispatch({ type: 'SET_SCENE_CHANGES', sceneChanges })
      },
      onError: (error: string) => {
        console.error(`🎬 [DEBUG] Scene detection error:`, error)
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
    path: state.path,
    keyframes,
    currentCrop,
    currentTime: state.currentTime,
    activeKeyframe,
    detectionStatus: state.detectionStatus,
    detections: state.detections,
    sceneChanges: state.sceneChanges,
    sceneDetectionStatus: state.sceneDetectionStatus,
    autoTrackingEnabled: state.autoTrackingEnabled,
    sceneChangeDetectionEnabled: state.sceneChangeDetectionEnabled,
    lastSceneChangeLevel: state.lastSceneChangeLevel,
    setVideo,
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
    toggleSceneChangeDetection
  }
}

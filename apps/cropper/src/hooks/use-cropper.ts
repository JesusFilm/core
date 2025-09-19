'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type {
  CropBox,
  CropKeyframe,
  CropPath,
  CropWindow,
  DetectionResult,
  Video
} from '../types'
import {
  createCropKeyframe,
  createInitialPath,
  cropBoxAtTime,
  deleteKeyframe,
  mergeDetectionsIntoPath,
  replaceKeyframe,
  setKeyframes
} from '../lib/crop-engine'
import { interpolateKeyframes } from '../lib/interpolation'
import { runDetection } from '../lib/detection'
import { clampTime } from '../lib/video-utils'

interface CropperState {
  video: Video | null
  path: CropPath | null
  activeKeyframeId: string | null
  currentTime: number
  detections: DetectionResult[]
  detectionStatus: 'idle' | 'running' | 'complete'
  autoTrackingEnabled: boolean
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

const INITIAL_STATE: CropperState = {
  video: null,
  path: null,
  activeKeyframeId: null,
  currentTime: 0,
  detections: [],
  detectionStatus: 'idle',
  autoTrackingEnabled: false
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
        autoTrackingEnabled: false
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
  autoTrackingEnabled: boolean
  setVideo: (video: Video | null) => void
  setTime: (time: number) => void
  addKeyframeAt: (time: number, window?: Partial<CropWindow>) => void
  updateKeyframe: (keyframeId: string, patch: Partial<CropWindow> & { time?: number }) => void
  removeKeyframe: (keyframeId: string) => void
  selectKeyframe: (keyframeId: string | null) => void
  requestDetection: (videoElement?: HTMLVideoElement) => void
  toggleAutoTracking: () => void
}

export function useCropper(): UseCropperResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const disposeDetectionRef = useRef<(() => void) | null>(null)

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
    console.log('🔍 requestDetection called, video:', !!state.video, 'videoElement:', !!videoElement)
    if (!state.video) {
      console.log('🔍 No video, skipping detection')
      return
    }

    console.log('🔍 Starting detection for video:', state.video.slug)
    dispatch({ type: 'SET_DETECTION_STATUS', status: 'running' })
    dispatch({ type: 'SET_DETECTIONS', detections: [] })

    disposeDetectionRef.current?.()

    const detectionOptions: any = {
      frameRate: 8
    }

    // If we have a video element, use it directly instead of creating a new one
    if (videoElement) {
      detectionOptions.videoElement = videoElement
      detectionOptions.useExistingElement = true
    } else {
      // Fallback to URL-based detection (which may not work with HLS)
      detectionOptions.videoUrl = state.video.src
    }

    disposeDetectionRef.current = runDetection(state.video.duration, {
      onChunk: (result) => {
        console.log('🔍 Detection chunk received:', result)
        dispatch({ type: 'PUSH_DETECTION', detection: result })
      },
      onComplete: (results) => {
        console.log('🔍 Detection complete, results:', results.length)
        dispatch({ type: 'SET_DETECTION_STATUS', status: 'complete' })
        dispatch({ type: 'SET_DETECTIONS', detections: results })
        dispatch({ type: 'MERGE_DETECTIONS' })
      },
      onError: (error) => {
        console.log('🔍 Detection error:', error)
        dispatch({ type: 'SET_DETECTION_STATUS', status: 'idle' })
      }
    }, detectionOptions)
  }, [state.video])

  const toggleAutoTracking = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_TRACKING' })
  }, [])

  // Note: Auto-detection is now handled by CropWorkspace when checkbox is toggled

  useEffect(() => {
    return () => {
      disposeDetectionRef.current?.()
      disposeDetectionRef.current = null
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
    autoTrackingEnabled: state.autoTrackingEnabled,
    setVideo,
    setTime,
    addKeyframeAt,
    updateKeyframe,
    removeKeyframe,
    selectKeyframe,
    requestDetection,
    toggleAutoTracking
  }
}

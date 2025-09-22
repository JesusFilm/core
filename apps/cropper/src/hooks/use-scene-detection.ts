import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  SceneMetadata,
  SceneChangeEvent,
  SceneDetectionConfig,
  SceneDetectionCallbacks,
  SceneDetectionOptions,
  UseSceneDetectionReturn
} from '../types/scene-tracking'
import { DEFAULT_SCENE_DETECTION_CONFIG } from '../types/scene-tracking'
import {
  extractSceneMetadata,
  updateSceneMetadata,
  detectSceneChange,
  shouldSplitScene,
  isValidScene
} from '../lib/scene-detection-utils'

export const useSceneDetection = (
  callbacks?: SceneDetectionCallbacks
): UseSceneDetectionReturn => {
  const [currentScene, setCurrentScene] = useState<SceneMetadata | null>(null)
  const [sceneHistory, setSceneHistory] = useState<SceneMetadata[]>([])
  const [changeEvents, setChangeEvents] = useState<SceneChangeEvent[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [lastChangeTime, setLastChangeTime] = useState(0)

  const configRef = useRef<SceneDetectionConfig>(DEFAULT_SCENE_DETECTION_CONFIG)
  const videoElementRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<OffscreenCanvas | null>(null)
  const ctxRef = useRef<OffscreenCanvasRenderingContext2D | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastProcessedTimeRef = useRef(0)

  // Initialize canvas for frame processing
  const initializeCanvas = useCallback((videoElement: HTMLVideoElement) => {
    if (typeof window === 'undefined') return false

    try {
      const canvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight)
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        console.warn('Scene detection: Could not get canvas context')
        return false
      }

      canvasRef.current = canvas
      ctxRef.current = ctx
      return true
    } catch (error) {
      console.warn('Scene detection: Could not create OffscreenCanvas, falling back to regular canvas')
      try {
        const canvas = document.createElement('canvas')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          console.error('Scene detection: Could not get canvas context')
          return false
        }

        canvasRef.current = canvas as any // Type assertion for OffscreenCanvas compatibility
        ctxRef.current = ctx as any
        return true
      } catch (fallbackError) {
        console.error('Scene detection: Canvas initialization failed', fallbackError)
        return false
      }
    }
  }, [])

  // Extract frame from video element
  const extractFrame = useCallback((): ImageData | null => {
    const video = videoElementRef.current
    const canvas = canvasRef.current
    const ctx = ctxRef.current

    if (!video || !canvas || !ctx) return null

    try {
      // Update canvas size if video dimensions changed
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      return ctx.getImageData(0, 0, canvas.width, canvas.height)
    } catch (error) {
      console.error('Scene detection: Frame extraction failed', error)
      return null
    }
  }, [])

  // Process frame for scene detection
  const processFrame = useCallback((frameData: ImageData, timestamp: number) => {
    const sceneId = `scene_${timestamp}`

    try {
      // Extract metadata from current frame
      const frameMetadata = extractSceneMetadata(frameData, timestamp, sceneId)

      setCurrentScene(currentScene => {
        if (!currentScene) {
          // First scene
          callbacks?.onSceneUpdate?.(frameMetadata)
          return frameMetadata
        }

        // Check for scene change
        const changeEvent = detectSceneChange(currentScene, frameMetadata, configRef.current)

        if (changeEvent) {
          // Scene change detected
          console.log('Scene change detected:', {
            type: changeEvent.changeType,
            confidence: changeEvent.confidence,
            brightnessDelta: changeEvent.metadata.brightnessDelta,
            timestamp: changeEvent.timestamp
          })

          setLastChangeTime(timestamp)
          setChangeEvents(prev => [...prev, changeEvent])
          setSceneHistory(prev => {
            const updatedHistory = [...prev]
            if (isValidScene(currentScene, configRef.current)) {
              updatedHistory.push(currentScene)
            }
            return updatedHistory
          })

          callbacks?.onSceneChange?.(changeEvent)
          callbacks?.onSceneUpdate?.(frameMetadata)

          return frameMetadata
        } else {
          // Update current scene metadata
          const updatedScene = updateSceneMetadata(currentScene, frameData, timestamp)

          // Check if scene should be split due to duration
          if (shouldSplitScene(updatedScene, timestamp, configRef.current)) {
            console.log('Scene split due to duration:', updatedScene.id)

            setSceneHistory(prev => {
              const updatedHistory = [...prev]
              if (isValidScene(updatedScene, configRef.current)) {
                updatedHistory.push(updatedScene)
              }
              return updatedHistory
            })

            const newSceneId = `scene_${timestamp + 1}`
            const newScene = extractSceneMetadata(frameData, timestamp, newSceneId)
            callbacks?.onSceneUpdate?.(newScene)

            return newScene
          }

          callbacks?.onSceneUpdate?.(updatedScene)
          return updatedScene
        }
      })
    } catch (error) {
      console.error('Scene detection: Frame processing failed', error)
      callbacks?.onError?.(error instanceof Error ? error.message : 'Unknown processing error')
    }
  }, [callbacks])

  // Main detection loop
  const detectionLoop = useCallback(() => {
    const video = videoElementRef.current
    if (!video || !isDetecting) return

    const currentTime = video.currentTime * 1000 // Convert to milliseconds

    // Skip if we processed this time recently (throttle)
    if (currentTime - lastProcessedTimeRef.current < (1000 / configRef.current.temporalWindow)) {
      animationFrameRef.current = requestAnimationFrame(detectionLoop)
      return
    }

    lastProcessedTimeRef.current = currentTime

    const frameData = extractFrame()
    if (frameData) {
      processFrame(frameData, currentTime)
    }

    animationFrameRef.current = requestAnimationFrame(detectionLoop)
  }, [isDetecting, extractFrame, processFrame])

  // Start scene detection
  const startDetection = useCallback((
    videoElement: HTMLVideoElement,
    options: SceneDetectionOptions = {}
  ) => {
    if (isDetecting) {
      console.warn('Scene detection: Already detecting')
      return
    }

    videoElementRef.current = videoElement

    // Update configuration
    if (options.config) {
      configRef.current = { ...DEFAULT_SCENE_DETECTION_CONFIG, ...options.config }
    }

    // Initialize canvas
    if (!initializeCanvas(videoElement)) {
      callbacks?.onError?.('Failed to initialize canvas for scene detection')
      return
    }

    console.log('Scene detection: Starting with config:', configRef.current)

    setIsDetecting(true)
    callbacks?.onDetectionStart?.()

    // Start detection loop
    animationFrameRef.current = requestAnimationFrame(detectionLoop)
  }, [isDetecting, initializeCanvas, detectionLoop, callbacks])

  // Stop scene detection
  const stopDetection = useCallback(() => {
    if (!isDetecting) return

    console.log('Scene detection: Stopping')

    setIsDetecting(false)

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Finalize current scene
    setCurrentScene(currentScene => {
      if (currentScene && isValidScene(currentScene, configRef.current)) {
        setSceneHistory(prev => [...prev, currentScene])
      }
      return null
    })

    callbacks?.onDetectionEnd?.()
  }, [isDetecting, callbacks])

  // Get scene at specific time
  const getSceneAtTime = useCallback((time: number): SceneMetadata | null => {
    if (currentScene && time >= currentScene.startTime && time <= currentScene.endTime) {
      return currentScene
    }

    // Search in history
    for (let i = sceneHistory.length - 1; i >= 0; i--) {
      const scene = sceneHistory[i]
      if (time >= scene.startTime && time <= scene.endTime) {
        return scene
      }
    }

    return null
  }, [currentScene, sceneHistory])

  // Get scenes in time range
  const getScenesInRange = useCallback((startTime: number, endTime: number): SceneMetadata[] => {
    const scenes: SceneMetadata[] = []

    // Check current scene
    if (currentScene && currentScene.startTime <= endTime && currentScene.endTime >= startTime) {
      scenes.push(currentScene)
    }

    // Check history
    for (const scene of sceneHistory) {
      if (scene.startTime <= endTime && scene.endTime >= startTime) {
        scenes.push(scene)
      }
    }

    return scenes.sort((a, b) => a.startTime - b.startTime)
  }, [currentScene, sceneHistory])

  // Clear history
  const clearHistory = useCallback(() => {
    setCurrentScene(null)
    setSceneHistory([])
    setChangeEvents([])
    setLastChangeTime(0)
    lastProcessedTimeRef.current = 0
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    currentScene,
    sceneHistory,
    changeEvents,
    isDetecting,
    startDetection,
    stopDetection,
    getSceneAtTime,
    getScenesInRange,
    clearHistory
  }
}

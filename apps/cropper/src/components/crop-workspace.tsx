'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Pause as PauseIcon, Plus } from 'lucide-react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type {
  CropBox,
  CropKeyframe,
  CropWindow,
  DetectionResult,
  Video
} from '../types'
import { formatTime } from '../lib/video-utils'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { SceneChangeIndicator } from './scene-change-indicator'

// Custom Play Triangle SVG Component
const PlayTriangle = ({ className }: { className?: string }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="currentColor"
    className={className}
  >
    <path d="M6 5L26 16L6 27V5Z" />
  </svg>
)

interface CropWorkspaceProps {
  video: Video | null
  bindVideo: (element: HTMLVideoElement | null) => void
  currentTime: number
  duration: number
  onTimeChange: (time: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
  onCreateKeyframe: () => void
  onToggleAutoTracking?: () => void
  onRunDetection?: (videoElement: HTMLVideoElement) => void
  onPauseDetection?: () => void
  onResumeDetection?: () => void
  autoTrackingEnabled?: boolean
  onToggleSceneChangeDetection?: () => void
  onRunSceneDetection?: (videoElement: HTMLVideoElement) => void
  onPauseSceneDetection?: () => void
  onResumeSceneDetection?: () => void
  sceneChangeDetectionEnabled?: boolean
  sceneChanges?: Array<{ time: number; level: string }>
  lastSceneChangeLevel?: 'stable' | 'moderate' | 'significant' | 'transition' | null
  crop: CropBox | null
  activeKeyframe: CropKeyframe | null
  onUpdateActiveKeyframe: (patch: Partial<CropWindow>) => void
  detections: DetectionResult[]
  detectionStatus: 'idle' | 'running' | 'complete'
  // New adjustable parameters
  focusChangeThreshold?: number
  detectionTimeWindow?: number
  onFocusChangeThresholdChange?: (value: number) => void
  onDetectionTimeWindowChange?: (value: number) => void
}

export function CropWorkspace({
  video,
  bindVideo,
  currentTime,
  duration,
  onTimeChange,
  isPlaying,
  onTogglePlay,
  onCreateKeyframe,
  onToggleAutoTracking,
  onRunDetection,
  onPauseDetection,
  onResumeDetection,
  autoTrackingEnabled = true,
  onToggleSceneChangeDetection,
  onRunSceneDetection,
  onPauseSceneDetection,
  onResumeSceneDetection,
  sceneChangeDetectionEnabled = false,
  sceneChanges = [],
  lastSceneChangeLevel,
  crop,
  activeKeyframe,
  onUpdateActiveKeyframe,
  detections,
  detectionStatus,
  focusChangeThreshold = 0.005,
  detectionTimeWindow = 0.3,
  onFocusChangeThresholdChange,
  onDetectionTimeWindowChange
}: CropWorkspaceProps) {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false)
  const [showSceneIndicator, setShowSceneIndicator] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Custom bind function that also stores the element reference
  const customBindVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element
    bindVideo(element)
  }, [bindVideo])

  // Auto-start detection when component mounts with auto tracking enabled
  useEffect(() => {
    if (autoTrackingEnabled && onRunDetection && videoRef.current && video) {
      onRunDetection(videoRef.current)
    }
  }, [autoTrackingEnabled, onRunDetection, video])

  // Auto-start scene detection when component mounts with scene detection enabled
  useEffect(() => {
    if (sceneChangeDetectionEnabled && onRunSceneDetection && videoRef.current && video) {
      console.log(`🎬 [DEBUG] Auto-starting scene detection - video element: ${!!videoRef.current}, video: ${video.slug}, video dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`)
      onRunSceneDetection(videoRef.current)
    } else {
      console.log(`🎬 [DEBUG] Scene detection conditions not met - enabled: ${sceneChangeDetectionEnabled}, has handler: ${!!onRunSceneDetection}, has video element: ${!!videoRef.current}, has video: ${!!video}`)
    }
  }, [sceneChangeDetectionEnabled, onRunSceneDetection, video])

  const handleAutoTrackingToggle = useCallback(() => {
    // First update the state
    onToggleAutoTracking?.()

    // If enabling auto tracking and we have a video element, run detection
    if (!autoTrackingEnabled && onRunDetection && videoRef.current && video) {
      onRunDetection(videoRef.current)
    }
  }, [autoTrackingEnabled, onToggleAutoTracking, onRunDetection, video])

  const handleSceneChangeDetectionToggle = useCallback(() => {
    console.log(`🎬 [DEBUG] Scene detection toggle clicked: ${sceneChangeDetectionEnabled} → ${!sceneChangeDetectionEnabled}`)
    const newEnabled = !sceneChangeDetectionEnabled

    // First update the state
    onToggleSceneChangeDetection?.()

    // If enabling scene detection and we have a video element, run scene detection
    if (newEnabled && onRunSceneDetection && videoRef.current && video) {
      console.log(`🎬 [DEBUG] Starting scene detection from toggle - video element: ${!!videoRef.current}, video: ${video.slug}`)
      onRunSceneDetection(videoRef.current)
    } else {
      console.log(`🎬 [DEBUG] Cannot start scene detection - enabled: ${newEnabled}, has handler: ${!!onRunSceneDetection}, has video element: ${!!videoRef.current}, has video: ${!!video}`)
    }
  }, [sceneChangeDetectionEnabled, onToggleSceneChangeDetection, onRunSceneDetection, video])

  // Pause/resume detection based on playback state when auto tracking is enabled
  useEffect(() => {
    if (!autoTrackingEnabled) {
      return
    }

    if (isPlaying) {
      onResumeDetection?.()
    } else {
      onPauseDetection?.()
    }
  }, [isPlaying, autoTrackingEnabled, onPauseDetection, onResumeDetection])

  const detectionOverlay = useMemo(() => {
    if (!detections.length) {
      return []
    }

    return detections.filter((detection) => Math.abs(detection.time - currentTime) <= detectionTimeWindow)
  }, [detections, currentTime, detectionTimeWindow])

  // Auto-adjust crop box position when green detection box is outside yellow crop boundaries
  // This ensures the crop window follows the detected subject in real-time
  // Use refs to track previous values and prevent infinite loops
  const lastRepositionRef = useRef<{ focusX: number; focusY: number; timestamp: number } | null>(null)

  // Track detection movement history for velocity-based predictions
  const detectionHistoryRef = useRef<Array<{ time: number; x: number; y: number }>>([])
  const lastSceneChangeRef = useRef(lastSceneChangeLevel)

  useEffect(() => {
    if (!autoTrackingEnabled || !crop || !detectionOverlay.length || !activeKeyframe) {
      return
    }

    // Find primary detection with priority: face > person > silhouette > center
    const priorityOrder = { face: 4, person: 3, silhouette: 2, center: 1, object: 0 }
    const primaryDetection = detectionOverlay.reduce((best, current) => {
      const bestPriority = priorityOrder[best.label] || 0
      const currentPriority = priorityOrder[current.label] || 0

      if (currentPriority > bestPriority) {
        return current
      } else if (currentPriority === bestPriority && current.confidence > best.confidence) {
        return current
      }
      return best
    })

    // Calculate detection center
    const detectionCenterX = primaryDetection.box.x + primaryDetection.box.width / 2
    const detectionCenterY = primaryDetection.box.y + primaryDetection.box.height / 2

    // Track detection movement history
    detectionHistoryRef.current.push({
      time: currentTime,
      x: detectionCenterX,
      y: detectionCenterY
    })

    // Keep only recent history (last 10 detections)
    if (detectionHistoryRef.current.length > 10) {
      detectionHistoryRef.current.shift()
    }

    // Calculate predicted position based on movement velocity
    let predictedX = detectionCenterX
    let predictedY = detectionCenterY

    if (detectionHistoryRef.current.length >= 3) {
      const recent = detectionHistoryRef.current.slice(-3)
      const timeDiff = recent[2].time - recent[0].time
      if (timeDiff > 0) {
        const velocityX = (recent[2].x - recent[0].x) / timeDiff
        const velocityY = (recent[2].y - recent[0].y) / timeDiff

        // Predict position 0.5 seconds into the future
        const predictionTime = 0.5
        predictedX = detectionCenterX + velocityX * predictionTime
        predictedY = detectionCenterY + velocityY * predictionTime

        // Clamp predictions to valid range
        predictedX = Math.max(0, Math.min(1, predictedX))
        predictedY = Math.max(0, Math.min(1, predictedY))
      }
    }

    // Use predicted position for more proactive tracking
    const targetFocusX = Math.max(0, Math.min(1, predictedX))
    const targetFocusY = Math.max(0, Math.min(1, predictedY))

    // Check if detection is outside or near crop boundaries
    const cropLeft = crop.x
    const cropRight = crop.x + crop.width
    const cropTop = crop.y
    const cropBottom = crop.y + crop.height

    // Define a "near boundary" zone (5% of crop size) to trigger repositioning earlier
    const boundaryThreshold = 0.05
    const nearBoundaryThresholdX = crop.width * boundaryThreshold
    const nearBoundaryThresholdY = crop.height * boundaryThreshold

    // Check if predicted detection position is outside boundaries OR very close to boundaries
    const detectionOutsideCrop = predictedX < cropLeft ||
                                predictedX > cropRight ||
                                predictedY < cropTop ||
                                predictedY > cropBottom

    const detectionNearBoundary = (predictedX - cropLeft < nearBoundaryThresholdX) ||
                                 (cropRight - predictedX < nearBoundaryThresholdX) ||
                                 (predictedY - cropTop < nearBoundaryThresholdY) ||
                                 (cropBottom - predictedY < nearBoundaryThresholdY)

    // Reposition if detection is outside OR near boundary
    if (detectionOutsideCrop || detectionNearBoundary) {
      // Minimal throttling to prevent infinite loops but allow responsive tracking
      const now = Date.now()
      const timeSinceLastReposition = lastRepositionRef.current
        ? now - lastRepositionRef.current.timestamp
        : Infinity

      // Allow repositioning if enough time has passed OR if predicted focus has changed significantly
      const hasFocusChanged = lastRepositionRef.current &&
        (Math.abs(lastRepositionRef.current.focusX - targetFocusX) > focusChangeThreshold ||
         Math.abs(lastRepositionRef.current.focusY - targetFocusY) > focusChangeThreshold)

      // Much more aggressive: only prevent repositioning if it's been less than 50ms AND focus hasn't changed
      if (timeSinceLastReposition > 50 || hasFocusChanged) {
        // Update the active keyframe to center on the predicted detection position
        onUpdateActiveKeyframe({
          focusX: targetFocusX,
          focusY: targetFocusY
        })

        // Track the reposition to prevent loops
        lastRepositionRef.current = {
          focusX: targetFocusX,
          focusY: targetFocusY,
          timestamp: now
        }

        console.log('🎯 Auto-repositioning crop window:', {
          detectionCenter: { x: detectionCenterX.toFixed(3), y: detectionCenterY.toFixed(3) },
          predictedPosition: { x: predictedX.toFixed(3), y: predictedY.toFixed(3) },
          cropBounds: {
            left: cropLeft.toFixed(3),
            right: cropRight.toFixed(3),
            top: cropTop.toFixed(3),
            bottom: cropBottom.toFixed(3)
          },
          newFocus: { x: targetFocusX.toFixed(3), y: targetFocusY.toFixed(3) },
          reason: detectionOutsideCrop ? 'outside_boundary' : 'near_boundary',
          timeSinceLast: timeSinceLastReposition,
          hasPrediction: detectionHistoryRef.current.length >= 3,
          focusThreshold: focusChangeThreshold,
          detectionWindow: detectionTimeWindow
        })
      }
    }
  }, [
    autoTrackingEnabled,
    crop,
    detectionOverlay,
    activeKeyframe,
    onUpdateActiveKeyframe,
    focusChangeThreshold
  ])

  // Trigger scene change indicator when scene change is detected (edge-based)
  useEffect(() => {
    if (sceneChangeDetectionEnabled && lastSceneChangeLevel &&
        lastSceneChangeLevel !== lastSceneChangeRef.current) {
      console.log(`🎬 [4/5] CropWorkspace detected edge-based scene change level: ${lastSceneChangeLevel}`)
      // Show indicator for significant or transition scene changes
      if (lastSceneChangeLevel === 'significant' || lastSceneChangeLevel === 'transition') {
        setShowSceneIndicator(true)
      }
      lastSceneChangeRef.current = lastSceneChangeLevel
    }
  }, [sceneChangeDetectionEnabled, lastSceneChangeLevel])

  const handleSceneIndicatorHide = useCallback(() => {
    setShowSceneIndicator(false)
  }, [])


  const cropOverlay = useMemo(() => {
    if (!crop) {
      return null
    }

    const left = crop.x * 100
    const top = crop.y * 100
    const width = crop.width * 100
    const height = crop.height * 100

    return {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height
    }
  }, [crop])

  const handlePointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!video || !activeKeyframe) {
        return
      }

      const bounds = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / bounds.width
      const y = (event.clientY - bounds.top) / bounds.height

      onUpdateActiveKeyframe({ focusX: Number(x.toFixed(4)), focusY: Number(y.toFixed(4)) })
    },
    [activeKeyframe?.id, onUpdateActiveKeyframe, video?.slug] // More stable dependencies
  )

  const handleVideoElementRef = useCallback(
    (element: HTMLVideoElement | null) => {
      if (element) {
        // Prevent any autoplay by explicitly setting it to false
        element.autoplay = false
        element.setAttribute('autoplay', 'false')

        // Monitor for autoplay attribute changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'autoplay') {
              // Immediately revert any autoplay changes
              if (element.autoplay) {
                element.autoplay = false
                element.setAttribute('autoplay', 'false')
              }
            }
          })
        })

        observer.observe(element, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: ['autoplay']
        })

        // Clean up observer when element is removed
        const cleanup = () => observer.disconnect()
        element.addEventListener('DOMNodeRemoved', cleanup)

        // Useful diagnostics while the video loading sequence settles
        const inDom = typeof document !== 'undefined' && document.body.contains(element)
      } else {
        console.log(`🎬 [DEBUG] Video element unmounted`)
      }

      customBindVideo(element)
    },
    [customBindVideo]
  )


  return (
    <section className="panel space-y-4 p-4 px-0">

      <div
        className="relative aspect-video w-full overflow-hidden rounded-3xl bg-transparent"
        onPointerDown={handlePointer}
        style={{ position: 'relative' }}
      >
        {video ? (
          <>
            {/* Always render the video element */}
            <video
              key="video-player" // Stable key to prevent React from unmounting/remounting
              ref={handleVideoElementRef}
              className="video-js vjs-default-skin h-full w-full"
              controls={false}
              playsInline
              preload="metadata"
              poster={video.poster}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />

            {/* Scene Change Indicator */}
            <SceneChangeIndicator
              show={showSceneIndicator}
              onHide={handleSceneIndicatorHide}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-stone-500">
            Select a video to begin.
          </div>
        )}

        {cropOverlay ? (
          <>
            {/* Blur overlays outside of the crop window */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 bg-stone-900/40 backdrop-blur-sm"
              style={{ height: `${Math.max(cropOverlay.top, 0)}%` }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bg-stone-900/40 backdrop-blur-sm"
              style={{
                top: `${Math.min(cropOverlay.bottom, 100)}%`,
                height: `${Math.max(100 - cropOverlay.bottom, 0)}%`
              }}
            />
            <div
              className="pointer-events-none absolute bg-stone-900/40 backdrop-blur-sm"
              style={{
                top: `${cropOverlay.top}%`,
                left: 0,
                width: `${Math.max(cropOverlay.left, 0)}%`,
                height: `${cropOverlay.height}%`
              }}
            />
            <div
              className="pointer-events-none absolute bg-stone-900/40 backdrop-blur-sm"
              style={{
                top: `${cropOverlay.top}%`,
                left: `${Math.min(cropOverlay.right, 100)}%`,
                width: `${Math.max(100 - cropOverlay.right, 0)}%`,
                height: `${cropOverlay.height}%`
              }}
            />

            <div
              className="pointer-events-none absolute border-2 border-yellow-400"
              style={{
                left: `${cropOverlay.left}%`,
                top: `${cropOverlay.top}%`,
                width: `${cropOverlay.width}%`,
                height: `${cropOverlay.height}%`
              }}
            >
              <div className="absolute right-2 top-2 rounded bg-accent/90 px-2 text-[10px] font-semibold text-slate-950">
                9:16
              </div>
            </div>
          </>
        ) : null}

        {detectionOverlay.map((detection) => {
          // Calculate opacity based on confidence (0.3 to 1.0 range)
          const opacity = Math.max(0.3, Math.min(1.0, detection.confidence))

          return (
            <div
              key={detection.id}
              className="pointer-events-none absolute border border-success border-dashed"
              style={{
                left: `${detection.box.x * 100}%`,
                top: `${detection.box.y * 100}%`,
                width: `${detection.box.width * 100}%`,
                height: `${detection.box.height * 100}%`,
                opacity: opacity
              }}
            />
          )
        })}
      </div>

      <Slider
        className="mt-4"
        min={0}
        max={Math.max(duration, 0.1)}
        step={0.1}
        value={currentTime}
        onChange={(event) => onTimeChange(Number(event.target.value))}
        disabled={!video}
      />

      <div className="toolbar flex items-center justify-between px-0">
        <div className="flex items-center gap-2 px-0">
          <Button variant="default" size="sm" onClick={onTogglePlay} disabled={!video} className="rounded-full -ml-3">
            {isPlaying ? <PauseIcon className="h-8 w-8" /> : <PlayTriangle className="h-8 w-8" />}
          </Button>
        {onToggleAutoTracking && (
          <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoTrackingEnabled}
              onChange={handleAutoTrackingToggle}
              disabled={!video}
              className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400 focus:ring-2"
            />
            Face detection
          </label>
        )}

        {onToggleSceneChangeDetection && (
          <label className="flex items-center gap-2 text-sm text-stone-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sceneChangeDetectionEnabled}
              onChange={handleSceneChangeDetectionToggle}
              disabled={!video}
              className="rounded border-slate-600 bg-slate-800 text-orange-400 focus:ring-orange-400 focus:ring-2"
            />
            Scene detection
          </label>
        )}

        {lastSceneChangeLevel && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-400">Scene:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                lastSceneChangeLevel === 'stable' ? 'bg-green-500/20 text-green-400' :
                lastSceneChangeLevel === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                lastSceneChangeLevel === 'significant' ? 'bg-orange-500/20 text-orange-400' :
                'bg-red-500/20 text-red-400'
              }`}
            >
              {lastSceneChangeLevel}
            </span>
          </div>
        )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCreateKeyframe} disabled={!video} className="rounded-full">
            <Plus className="h-4 w-4" /> Add Keyframe
          </Button>
          <span className="rounded-full bg-stone-600/30 px-2 py-1 font-medium text-xs text-stone-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Face Detection Settings Accordion */}
      {autoTrackingEnabled && (
        <div className="mt-6 rounded-lg overflow-hidden">
          <button
            className="w-full p-4 flex items-center justify-between hover:bg-stone-800/50 transition-colors cursor-pointer bg-stone-900/30"
            onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          >
            <h3 className="text-sm font-medium text-stone-300">Face Detection Settings</h3>
            <div className={`transform transition-transform duration-200 ${isSettingsExpanded ? 'rotate-180' : 'rotate-0'}`}>
              <ChevronDown className="h-4 w-4 text-stone-400" />
            </div>
          </button>

          {isSettingsExpanded && (
            <div className="p-4 space-y-4 bg-stone-900/20">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs text-stone-400">
                    Focus Change Threshold: {focusChangeThreshold.toFixed(3)}
                  </label>
                  <Slider
                    label="Focus Change Threshold"
                    min={0.001}
                    max={0.05}
                    step={0.001}
                    value={focusChangeThreshold}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      onFocusChangeThresholdChange?.(value)
                    }}
                    disabled={!video}
                  />
                  <p className="text-xs text-stone-500">
                    Minimum position change to trigger repositioning (lower = more responsive)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-stone-400">
                    Detection Time Window: ±{detectionTimeWindow.toFixed(1)}s
                  </label>
                  <Slider
                    label="Detection Time Window"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={detectionTimeWindow}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      onDetectionTimeWindowChange?.(value)
                    }}
                    disabled={!video}
                  />
                  <p className="text-xs text-stone-500">
                    Time range around current playback to consider detections
                  </p>
                </div>
              </div>
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => {
                    onFocusChangeThresholdChange?.(0.005)
                    onDetectionTimeWindowChange?.(0.3)
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                  disabled={!video}
                >
                  Reset to Optimal Settings
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preprocessing Dialog rendered via trigger above */}
    </section>
  )
}

'use client'

import { useCallback, useMemo, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { CropBox, CropKeyframe, CropWindow, DetectionResult, Video } from '../types'
import { formatTime } from '../lib/video-utils'
import { Button } from './ui/button'
import { Slider } from './ui/slider'

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
  autoTrackingEnabled?: boolean
  crop: CropBox | null
  activeKeyframe: CropKeyframe | null
  onUpdateActiveKeyframe: (patch: Partial<CropWindow>) => void
  detections: DetectionResult[]
  detectionStatus: 'idle' | 'running' | 'complete'
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
  autoTrackingEnabled = false,
  crop,
  activeKeyframe,
  onUpdateActiveKeyframe,
  detections,
  detectionStatus
}: CropWorkspaceProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  console.log('🎬 CropWorkspace render:', {
    videoSlug: video?.slug,
    currentTime,
    duration,
    isPlaying,
    activeKeyframeId: activeKeyframe?.id,
    detectionStatus,
    autoTrackingEnabled
  })

  // Custom bind function that also stores the element reference
  const customBindVideo = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element
    bindVideo(element)
  }, [bindVideo])

  const handleAutoTrackingToggle = useCallback(() => {
    const newEnabled = !autoTrackingEnabled
    console.log('🔍 Auto tracking toggle:', newEnabled)

    // First update the state
    onToggleAutoTracking?.()

    // If enabling auto tracking and we have a video element, run detection
    if (newEnabled && onRunDetection && videoRef.current && video) {
      console.log('🔍 Auto tracking enabled, running detection')
      onRunDetection(videoRef.current)
    }
  }, [autoTrackingEnabled, onToggleAutoTracking, onRunDetection, video])

  const detectionOverlay = useMemo(() => {
    if (!detections.length) {
      return []
    }

    return detections.filter((detection) => Math.abs(detection.time - currentTime) <= 0.5)
  }, [detections, currentTime])

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
      console.log('🎬 Video ref callback - element:', element ? 'present' : 'null')

      if (element) {
        // Useful diagnostics while the video loading sequence settles
        const inDom = typeof document !== 'undefined' && document.body.contains(element)
        console.log('🎬 Video element in DOM check:', inDom)
        console.log('🎬 Video element dimensions:', element.offsetWidth, 'x', element.offsetHeight)
      }

      customBindVideo(element)
    },
    [customBindVideo]
  )

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Crop Workspace</h2>
          <p className="text-xs text-slate-400">
            Drag the playhead or click inside the frame to retarget the 9:16 crop window.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded-full bg-slate-800/80 px-2 py-1 font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <span
            className={
              detectionStatus === 'complete'
                ? 'text-success'
                : detectionStatus === 'running'
                  ? 'text-accent'
                  : 'text-slate-500'
            }
          >
            Detection: {detectionStatus}
          </span>
        </div>
      </header>

      <div
        className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
        onPointerDown={handlePointer}
        style={{ position: 'relative' }}
      >
        {video ? (
          <>
            {console.log('🎬 Rendering video element for:', video.slug)}
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
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
            Select a video to begin.
          </div>
        )}

        {cropOverlay ? (
          <>
            {/* Blur overlays outside of the crop window */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 bg-slate-950/40 backdrop-blur-sm"
              style={{ height: `${Math.max(cropOverlay.top, 0)}%` }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bg-slate-950/40 backdrop-blur-sm"
              style={{
                top: `${Math.min(cropOverlay.bottom, 100)}%`,
                height: `${Math.max(100 - cropOverlay.bottom, 0)}%`
              }}
            />
            <div
              className="pointer-events-none absolute bg-slate-950/40 backdrop-blur-sm"
              style={{
                top: `${cropOverlay.top}%`,
                left: 0,
                width: `${Math.max(cropOverlay.left, 0)}%`,
                height: `${cropOverlay.height}%`
              }}
            />
            <div
              className="pointer-events-none absolute bg-slate-950/40 backdrop-blur-sm"
              style={{
                top: `${cropOverlay.top}%`,
                left: `${Math.min(cropOverlay.right, 100)}%`,
                width: `${Math.max(100 - cropOverlay.right, 0)}%`,
                height: `${cropOverlay.height}%`
              }}
            />

            <div
              className="pointer-events-none absolute border-2 border-accent/90"
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

        {detectionOverlay.map((detection) => (
          <div
            key={detection.id}
            className="pointer-events-none absolute border border-success/60"
            style={{
              left: `${detection.box.x * 100}%`,
              top: `${detection.box.y * 100}%`,
              width: `${detection.box.width * 100}%`,
              height: `${detection.box.height * 100}%`
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onTogglePlay} disabled={!video}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button variant="outline" size="sm" onClick={onCreateKeyframe} disabled={!video}>
          Add Keyframe
        </Button>
        {onToggleAutoTracking && (
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoTrackingEnabled}
              onChange={handleAutoTrackingToggle}
              disabled={!video}
              className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400 focus:ring-2"
            />
            Auto tracking
          </label>
        )}
      </div>

      <Slider
        label="Timeline"
        min={0}
        max={Math.max(duration, 0.1)}
        step={0.1}
        value={currentTime}
        onChange={(event) => onTimeChange(Number(event.target.value))}
        disabled={!video}
      />
    </section>
  )
}

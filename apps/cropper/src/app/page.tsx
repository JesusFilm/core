'use client'

import { useCallback, useEffect } from 'react'
import { VideoPicker } from '../components/video-picker'
import { CropWorkspace } from '../components/crop-workspace'
import { Timeline } from '../components/timeline'
import { KeyframeEditor } from '../components/keyframe-editor'
import { ExportDialog } from '../components/export-dialog'
import { useVideo } from '../hooks/use-video'
import { useCropper } from '../hooks/use-cropper'
import { useExport } from '../hooks/use-export'
import { DebugWidget } from '../components/debug-widget'
import type { CropWindow } from '../types'
import type { VideoData } from '../types/video'

const FALLBACK_DEBUG_HLS_SRC = process.env.NEXT_PUBLIC_DEBUG_HLS_SRC ?? ''

export default function Page() {
  const {
    video,
    path,
    keyframes,
    currentCrop,
    currentTime,
    activeKeyframe,
    detectionStatus,
    detections,
    autoTrackingEnabled,
    setVideo,
    setTime,
    addKeyframeAt,
    updateKeyframe,
    removeKeyframe,
    selectKeyframe,
    requestDetection,
    toggleAutoTracking
  } = useCropper()

  // Create a wrapper function for detection that will be called from CropWorkspace
  const handleRunDetection = useCallback((videoElement: HTMLVideoElement) => {
    console.log('🔍 handleRunDetection called with video element')
    requestDetection(videoElement)
  }, [requestDetection])

  const {
    video: loadedVideo,
    currentTime: playbackTime,
    duration,
    isPlaying,
    bind,
    load,
    seek,
    togglePlayback
  } = useVideo()

  const {
    presets,
    activePresetId,
    status: exportStatus,
    progress: exportProgress,
    downloadUrl,
    error: exportError,
    isDialogOpen,
    start,
    reset,
    setActivePresetId,
    setDialogOpen
  } = useExport()

  // Keep cropper timeline aligned with playback time.
  useEffect(() => {
    if (!Number.isFinite(playbackTime)) {
      return
    }
    setTime(playbackTime)
  }, [playbackTime, setTime])

  useEffect(() => {
    if (video || loadedVideo || !FALLBACK_DEBUG_HLS_SRC) {
      return
    }

    const debugVideo = {
      slug: 'debug-stream',
      title: 'Debug Stream',
      description: '',
      duration: 0,
      width: 1920,
      height: 1080,
      fps: 29.97,
      src: FALLBACK_DEBUG_HLS_SRC,
      poster: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    }

    setVideo(debugVideo)
    load(debugVideo)
    reset()
  }, [load, loadedVideo, reset, setVideo, video])

  const handleVideoSelect = useCallback(
    (nextVideo: VideoData) => {
      console.log('🎬 Video selected:', nextVideo)
      console.log('🎬 Video HLS URL:', nextVideo.variant?.hls)

      // Convert VideoData to the format expected by cropper hooks
      const hlsSrc = nextVideo.variant?.hls ?? null
      const downloadSrc = nextVideo.variant?.downloads?.[0]?.url ?? null

      const cropperVideo = {
        slug: nextVideo.slug,
        title: nextVideo.title?.[0]?.value || 'Untitled Video',
        description: nextVideo.description?.[0]?.value || '',
        duration: nextVideo.variant?.duration || 0,
        width: nextVideo.variant?.downloads?.[0]?.width || 1920,
        height: nextVideo.variant?.downloads?.[0]?.height || 1080,
        fps: 29.97, // Default FPS
        src: hlsSrc || downloadSrc || '',
        poster: nextVideo.images?.[0]?.mobileCinematicHigh || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: []
      }

      if (!cropperVideo.src) {
        console.warn('🎬 Selected video is missing a playable source', {
          slug: nextVideo.slug,
          variantId: nextVideo.variant?.id
        })
      }

      console.log('🎬 Converted cropper video:', cropperVideo)
      setVideo(cropperVideo)
      load(cropperVideo)
      reset()
    },
    [load, reset, setVideo]
  )

  const handleTimeChange = useCallback(
    (time: number) => {
      seek(time)
      setTime(time)
    },
    [seek, setTime]
  )

  const handleAddKeyframe = useCallback(() => {
    const baseWindow: Partial<CropWindow> | undefined = activeKeyframe?.window
    addKeyframeAt(playbackTime, baseWindow)
  }, [activeKeyframe?.window, addKeyframeAt, playbackTime])

  const handleKeyframeChange = useCallback(
    (patch: Partial<CropWindow> & { time?: number }) => {
      if (!activeKeyframe) {
        return
      }

      updateKeyframe(activeKeyframe.id, patch)
    },
    [activeKeyframe, updateKeyframe]
  )

  const handleDeleteKeyframe = useCallback(
    (keyframeId: string) => {
      removeKeyframe(keyframeId)
    },
    [removeKeyframe]
  )

  const handleExportStart = useCallback(() => {
    if (!video || !path) {
      return
    }

    start(video, path, activePresetId)
  }, [activePresetId, path, start, video])

  const disableWorkspace = !video

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-white">Vertical Crop Studio</h1>
        <p className="text-sm text-slate-400">
          Transform horizontal source footage into vertical storytelling assets with keyframing, detection assistance, and
          simulated export workflows.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <VideoPicker activeVideo={null} onSelect={handleVideoSelect} />
        </aside>

        <section className="space-y-6">
          <CropWorkspace
            video={video ?? loadedVideo}
            bindVideo={bind}
            currentTime={currentTime}
            duration={duration}
            onTimeChange={handleTimeChange}
            isPlaying={isPlaying}
            onTogglePlay={togglePlayback}
            onCreateKeyframe={handleAddKeyframe}
            onToggleAutoTracking={toggleAutoTracking}
            onRunDetection={handleRunDetection}
            autoTrackingEnabled={autoTrackingEnabled}
            crop={currentCrop}
            activeKeyframe={activeKeyframe}
            onUpdateActiveKeyframe={handleKeyframeChange}
            detections={detections}
            detectionStatus={detectionStatus}
          />

          <Timeline
            keyframes={keyframes}
            duration={duration}
            currentTime={currentTime}
            activeKeyframeId={activeKeyframe?.id}
            onSeek={handleTimeChange}
            onSelectKeyframe={selectKeyframe}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <KeyframeEditor
              keyframe={activeKeyframe}
              onChange={handleKeyframeChange}
              onDelete={handleDeleteKeyframe}
              disabled={disableWorkspace}
            />

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Export</h3>
                <p className="text-xs text-slate-400">
                  Choose a preset and queue a simulated ffmpeg export to validate output dimensions and encoding settings.
                </p>
              </div>
              <ExportDialog
                presets={presets}
                activePresetId={activePresetId}
                status={exportStatus}
                progress={exportProgress}
                downloadUrl={downloadUrl}
                error={exportError}
                open={isDialogOpen}
                onOpenChange={setDialogOpen}
                onPresetChange={setActivePresetId}
                onStart={handleExportStart}
                onReset={reset}
                disabled={!video || !path}
              />
            </div>
          </div>
        </section>
      </div>

      <DebugWidget
        detectionStatus={detectionStatus}
        detections={detections}
        autoTrackingEnabled={autoTrackingEnabled}
        isVisible={process.env.NODE_ENV === 'development'}
      />
    </main>
  )
}

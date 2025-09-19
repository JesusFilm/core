'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { CropPath, ExportPreset, Video } from '../types'
import { runExport } from '../lib/export-engine'
import { reportError } from '../lib/error-handling'

const PRESETS: ExportPreset[] = [
  {
    id: 'social-1080x1920',
    name: 'Social Vertical 1080x1920',
    description: 'Optimised MP4 export for Reels, Shorts and TikTok.',
    width: 1080,
    height: 1920,
    fps: 30,
    bitrate: 8_000_000,
    format: 'mp4'
  },
  {
    id: 'story-720x1280',
    name: 'Story 720x1280',
    description: 'Balanced quality for story-style uploads.',
    width: 720,
    height: 1280,
    fps: 30,
    bitrate: 4_000_000,
    format: 'mp4'
  },
  {
    id: 'webm-portrait',
    name: 'WebM Portrait Preview',
    description: 'Lightweight preview for collaboration or CMS review.',
    width: 720,
    height: 1280,
    fps: 24,
    bitrate: 2_500_000,
    format: 'webm'
  }
]

export interface ExportState {
  status: 'idle' | 'processing' | 'complete' | 'error'
  progress: number
  downloadUrl: string | null
  error: string | null
  presets: ExportPreset[]
  activePresetId: string
  setActivePresetId: (presetId: string) => void
  start: (video: Video, path: CropPath, presetId?: string) => void
  reset: () => void
  isDialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

export function useExport(): ExportState {
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activePresetId, setActivePresetId] = useState(PRESETS[0].id)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const disposeRef = useRef<(() => void) | null>(null)

  const presets = useMemo(() => PRESETS, [])

  const reset = useCallback(() => {
    disposeRef.current?.()
    disposeRef.current = null
    setStatus('idle')
    setProgress(0)
    setDownloadUrl(null)
    setError(null)
  }, [])

  const start = useCallback(
    (video: Video, path: CropPath, presetId?: string) => {
      const preset = presets.find((candidate) => candidate.id === (presetId ?? activePresetId)) ?? presets[0]

      setStatus('processing')
      setProgress(0)
      setDownloadUrl(null)
      setError(null)

      disposeRef.current?.()
      disposeRef.current = runExport(video, preset, path, {
        onProgress: (value) => {
          setProgress(value)
        },
        onComplete: (url) => {
          setStatus('complete')
          setDownloadUrl(url)
          setProgress(100)
        },
        onError: (message) => {
          setStatus('error')
          const details = reportError(message, 'Export worker error')
          setError(details)
        }
      })
    },
    [activePresetId, presets]
  )

  return {
    status,
    progress,
    downloadUrl,
    error,
    presets,
    activePresetId,
    setActivePresetId,
    start,
    reset,
    isDialogOpen,
    setDialogOpen
  }
}

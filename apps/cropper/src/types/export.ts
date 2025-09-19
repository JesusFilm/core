import type { CropPath } from './crop-path'

export type ExportFormat = 'mp4' | 'webm'

export interface ExportPreset {
  id: string
  name: string
  description: string
  width: number
  height: number
  fps: number
  bitrate: number
  format: ExportFormat
}

export interface ExportJob {
  id: string
  videoSlug: string
  presetId: string
  status: 'idle' | 'queued' | 'processing' | 'complete' | 'error'
  progress: number
  createdAt: string
  updatedAt: string
  downloadUrl?: string
  error?: string
  path: CropPath
}

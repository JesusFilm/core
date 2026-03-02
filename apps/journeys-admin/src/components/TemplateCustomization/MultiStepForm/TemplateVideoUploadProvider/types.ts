/**
 * Shared types and constants for the TemplateVideoUploadProvider.
 */

export type VideoUploadStatus =
  | 'uploading'
  | 'processing'
  | 'updating'
  | 'completed'
  | 'error'

export interface VideoUploadState {
  status: VideoUploadStatus
  progress: number
  error?: string
  videoId?: string
}

export interface TemplateVideoUploadContextType {
  startUpload: (videoBlockId: string, file: File) => void
  getUploadStatus: (videoBlockId: string) => VideoUploadState | null
  hasActiveUploads: boolean
}

/** Internal task shape including retry count; not exposed to consumers. */
export interface UploadTaskInternal extends VideoUploadState {
  videoBlockId: string
  retryCount: number
}

export const INITIAL_POLL_INTERVAL = 2000
export const MAX_POLL_INTERVAL = 30000
export const MAX_RETRIES = 3
export const MAX_VIDEO_SIZE = 1073741824 // 1GB

/**
 * Creates an initial upload task for a video block in the uploading state.
 */
export function createInitialTask(videoBlockId: string): UploadTaskInternal {
  return {
    videoBlockId,
    status: 'uploading',
    progress: 0,
    retryCount: 0
  }
}

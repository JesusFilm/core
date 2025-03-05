import { createContext, useContext } from 'react'

export enum UploadStatus {
  'uploading',
  'processing',
  'error',
  'complete'
}

export interface UploadQueueItem {
  id: string
  videoBlockId?: string
  fileName: string
  status: UploadStatus
  error?: Error
  progress?: number
}

export interface uploadMuxVideoParams {
  files: File[]
}

export interface Context {
  uploadMuxVideo: (uploadMuxVideoParams) => AsyncGenerator<string>
  uploadQueue: Record<string, UploadQueueItem>
  activeUploads: () => number
  uploadMenuOpen: boolean
  setUploadMenuOpen: (menuOpen: boolean) => void
  setUpload: (id: string, upload: Partial<UploadQueueItem>) => void
}

export const BackgroundUploadContext = createContext<Context | undefined>(
  undefined
)

export function useBackgroundUpload(): Context {
  const context = useContext(BackgroundUploadContext)
  if (context === undefined)
    throw new Error(
      'No BackgroundUploadProvider found when calling useBackgroundUpload.'
    )

  return context
}

import { createContext, useContext } from 'react'
import { DetailedError, HttpStack } from 'tus-js-client'

export enum UploadStatus {
  'uploading',
  'processing',
  'error',
  'complete'
}

export interface UploadQueueItem {
  id: string
  fileName: string
  status: UploadStatus
  error?: DetailedError | Error
  progress?: number
}

export interface uploadCloudflareVideoParams {
  files: File[]
  httpStack?: HttpStack
}

export interface Context {
  uploadCloudflareVideo: (uploadCloudflareVideoParams) => AsyncGenerator<string>
  uploadQueue: Record<string, UploadQueueItem>
  activeUploads: () => number
  uploadMenuOpen: boolean
  setUploadMenuOpen: (menuOpen: boolean) => void
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

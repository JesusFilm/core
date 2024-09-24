import { createContext, useContext } from 'react'
import { DetailedError, HttpStack } from 'tus-js-client'

export enum UploadStatus {
  'uploading',
  'processing',
  'rejected',
  'tooLarge',
  'tooManyFiles',
  'invalidFileType',
  'error',
  'complete'
}

export interface UploadQueueItem {
  id: string
  fileName: string
  status: UploadStatus
  error?: DetailedError | Error
  progress?: number
  // onChange: (id: string) => void
}

export interface uploadCloudflareVideoParams {
  files: File[]
  httpStack?: HttpStack
  // onChange: (id: string) => void
}

export interface Context {
  uploadCloudflareVideo: (uploadCloudflareVideoParams) => AsyncGenerator<string>
  uploadQueue: Record<string, UploadQueueItem>
  activeUploads: () => number
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

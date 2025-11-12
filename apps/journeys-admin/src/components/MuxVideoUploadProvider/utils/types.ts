export interface PollingTask {
  videoId: string
  languageCode?: string
  status: 'processing' | 'completed' | 'error'
  startTime: number
  onComplete?: () => void
}

export interface UploadTask {
  videoBlockId: string
  file: File
  languageCode?: string
  languageName?: string
  status: 'waiting' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: Error
  videoId?: string
  onComplete?: (videoId: string) => void
}

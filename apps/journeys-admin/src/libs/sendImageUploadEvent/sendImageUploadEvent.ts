import { sendGTMEvent } from '@next/third-parties/google'

interface ImageUploadEventBase {
  fileName: string
  fileSize: number
  fileType: string
}

interface ImageUploadSuccessEvent extends ImageUploadEventBase {}

interface ImageUploadFailureEvent extends ImageUploadEventBase {
  errorCode?: string
}

export function sendImageUploadSuccessEvent({
  fileName,
  fileSize,
  fileType
}: ImageUploadSuccessEvent): void {
  sendGTMEvent({
    event: 'image_upload_success',
    fileName,
    fileSize,
    fileType
  })
}

export function sendImageUploadFailureEvent({
  fileName,
  fileSize,
  fileType,
  errorCode
}: ImageUploadFailureEvent): void {
  sendGTMEvent({
    event: 'image_upload_failure',
    fileName,
    fileSize,
    fileType,
    errorCode
  })
}

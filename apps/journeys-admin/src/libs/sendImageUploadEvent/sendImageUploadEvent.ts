import { sendGTMEvent } from '@next/third-parties/google'

interface ImageUploadEventBase {
  fileSize: number
  fileType: string
}

interface ImageUploadFailureEvent extends ImageUploadEventBase {
  errorCode?: string
}

export function sendImageUploadSuccessEvent({
  fileSize,
  fileType
}: ImageUploadEventBase): void {
  sendGTMEvent({
    event: 'image_upload_success',
    fileSize,
    fileType
  })
}

export function sendImageUploadFailureEvent({
  fileSize,
  fileType,
  errorCode
}: ImageUploadFailureEvent): void {
  sendGTMEvent({
    event: 'image_upload_failure',
    fileSize,
    fileType,
    errorCode
  })
}

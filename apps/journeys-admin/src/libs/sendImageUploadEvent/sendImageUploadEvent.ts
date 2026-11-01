import { sendGTMEvent } from '@next/third-parties/google'

interface ImageUploadEventBase {
  fileSize: number
  fileType: string
}

interface ImageUploadFailureEvent extends ImageUploadEventBase {
  errorCode?: string
  /**
   * What the file's bytes say it is (e.g. 'pdf', 'text'), as opposed to
   * `fileType`, which the browser guesses from the extension.
   */
  detectedFileType?: string
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
  errorCode,
  detectedFileType
}: ImageUploadFailureEvent): void {
  sendGTMEvent({
    event: 'image_upload_failure',
    fileSize,
    fileType,
    errorCode,
    detectedFileType
  })
}

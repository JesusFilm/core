import { useState } from 'react'
import {
  Accept,
  DropzoneOptions,
  ErrorCode,
  FileRejection,
  useDropzone
} from 'react-dropzone'

import { useCloudflareUploadByFileMutation } from '../useCloudflareUploadByFileMutation'

/**
 * Error codes for image upload.
 * ErrorCode: standard react-dropzone errors (e.g. 'file-too-large')
 * number: specific Cloudflare API error codes (e.g. 10003)
 * 'unknown-error': fallback for unexpected failures
 */
export type ImageUploadErrorCode = ErrorCode | number | 'unknown-error'

export interface UseImageUploadOptions {
  onUploadComplete: (url: string) => void
  onUploadStart?: () => void
  onUploadError?: (errorCode: ImageUploadErrorCode) => void
  maxSize?: number
  accept?: Accept
  disabled?: boolean
  noClick?: boolean
  noDrag?: boolean
  noKeyboard?: boolean
}

export interface UseImageUploadReturn {
  getRootProps: ReturnType<typeof useDropzone>['getRootProps']
  getInputProps: ReturnType<typeof useDropzone>['getInputProps']
  open: () => void
  isDragActive: boolean
  isDragAccept: boolean
  isDragReject: boolean
  loading: boolean
  success: boolean | undefined
  errorCode: ImageUploadErrorCode | undefined
  acceptedFiles: readonly File[]
  fileRejections: readonly FileRejection[]
  resetState: () => void
}

const DEFAULT_MAX_SIZE = 10485760 // 10MB
const DEFAULT_ACCEPT: Accept = {
  'image/png': [],
  'image/jpeg': [],
  'image/gif': [],
  'image/svg+xml': [],
  'image/heic': []
}

export function useImageUpload(
  useImageUploadOptions: UseImageUploadOptions
): UseImageUploadReturn {
  const {
    onUploadComplete,
    onUploadStart,
    onUploadError,
    maxSize = DEFAULT_MAX_SIZE,
    accept = DEFAULT_ACCEPT,
    disabled = false,
    noClick = true,
    noDrag = false,
    noKeyboard = false
  } = useImageUploadOptions
  const [createCloudflareUploadByFile] = useCloudflareUploadByFileMutation()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<boolean | undefined>(undefined)
  const [errorCode, setErrorCode] = useState<ImageUploadErrorCode | undefined>(
    undefined
  )

  const handleDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ): Promise<void> => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0].code as ImageUploadErrorCode
      setErrorCode(error)
      setLoading(false)
      setSuccess(false)
      onUploadError?.(error)
      return
    }

    if (acceptedFiles.length === 0) {
      return
    }

    setLoading(true)
    setSuccess(undefined)
    setErrorCode(undefined)
    onUploadStart?.()

    try {
      const { data } = await createCloudflareUploadByFile({})

      if (data?.createCloudflareUploadByFile?.uploadUrl != null) {
        const file = acceptedFiles[0]
        const formData = new FormData()
        formData.append('file', file)

        const uploadUrl = data.createCloudflareUploadByFile.uploadUrl
        const response = await (
          await fetch(uploadUrl, {
            method: 'POST',
            body: formData
          })
        ).json()

        if (response.success === true) {
          setSuccess(true)
          const src = `https://imagedelivery.net/${
            process.env.NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY ?? ''
          }/${response.result.id as string}/public`
          onUploadComplete(src)
          setTimeout(() => setSuccess(undefined), 4000)
        } else {
          setSuccess(false)
          if (response.errors?.length > 0) {
            const error = response.errors[0].code as ImageUploadErrorCode
            setErrorCode(error)
            onUploadError?.(error)
          }
        }
      } else {
        throw new Error('No upload URL')
      }
    } catch {
      setSuccess(false)
      const error: ImageUploadErrorCode = 'unknown-error'
      setErrorCode(error)
      onUploadError?.(error)
    } finally {
      setLoading(false)
    }
  }

  const dropzoneOptions: DropzoneOptions = {
    onDrop: handleDrop,
    maxSize,
    accept,
    disabled,
    noClick,
    noDrag,
    noKeyboard,
    multiple: false
  }

  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    fileRejections
  } = useDropzone(dropzoneOptions)

  const resetState = (): void => {
    setLoading(false)
    setSuccess(undefined)
    setErrorCode(undefined)
  }

  return {
    getRootProps,
    getInputProps,
    open,
    isDragActive,
    isDragAccept,
    isDragReject,
    loading,
    success,
    errorCode,
    acceptedFiles,
    fileRejections,
    resetState
  }
}

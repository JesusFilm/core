import { useState } from 'react'
import {
  Accept,
  DropzoneOptions,
  ErrorCode,
  FileRejection,
  useDropzone
} from 'react-dropzone'

import { useCloudflareUploadByFileMutation } from '../useCloudflareUploadByFileMutation'

export interface UseImageUploadOptions {
  onUploadComplete: (url: string) => void
  onUploadStart?: () => void
  onUploadError?: (errorCode: ErrorCode) => void
  maxSize?: number
  accept?: Accept
  disabled?: boolean
  noClick?: boolean
  noDrag?: boolean
  noKeyboard?: boolean
  multiple?: boolean
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
  errorCode: ErrorCode | undefined
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

export function useImageUpload({
  onUploadComplete,
  onUploadStart,
  onUploadError,
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
  disabled = false,
  noClick = true,
  noDrag = false,
  noKeyboard = false,
  multiple = false
}: UseImageUploadOptions): UseImageUploadReturn {
  const [createCloudflareUploadByFile] = useCloudflareUploadByFileMutation()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<boolean | undefined>(undefined)
  const [errorCode, setErrorCode] = useState<ErrorCode | undefined>(undefined)

  const handleDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ): Promise<void> => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0].code as ErrorCode
      setErrorCode(error)
      setLoading(false)
      setSuccess(false)
      onUploadError?.(error)
      return
    }

    if (acceptedFiles.length === 0) {
      return
    }

    const { data } = await createCloudflareUploadByFile({})
    setLoading(true)
    setSuccess(undefined)
    setErrorCode(undefined)
    onUploadStart?.()

    if (data?.createCloudflareUploadByFile?.uploadUrl != null) {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('file', file)

      const uploadUrl = data.createCloudflareUploadByFile.uploadUrl
      try {
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
            const error = response.errors[0].code as ErrorCode
            setErrorCode(error)
            onUploadError?.(error)
          }
        }
      } catch {
        setSuccess(false)
        const error = 'unknown-error' as ErrorCode
        setErrorCode(error)
        onUploadError?.(error)
      } finally {
        setLoading(false)
      }
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
    multiple
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

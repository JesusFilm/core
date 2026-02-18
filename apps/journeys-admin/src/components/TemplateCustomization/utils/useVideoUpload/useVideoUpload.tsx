import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { UpChunk } from '@mux/upchunk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'

export const CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation TemplateCustomizeCreateMuxVideoUploadByFileMutation($name: String!) {
    createMuxVideoUploadByFile(name: $name) {
      uploadUrl
      id
    }
  }
`

export const GET_MY_MUX_VIDEO_QUERY = gql`
  query TemplateCustomizeGetMyMuxVideoQuery($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`

const INITIAL_POLL_INTERVAL = 2000 // 2 seconds
const MAX_POLL_INTERVAL = 30000 // 30 seconds
const MAX_RETRIES = 3
const MAX_VIDEO_SIZE = 1073741824 // 1GB

export type VideoUploadStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'error'

interface UseVideoUploadOptions {
  onUploadComplete?: (videoId: string) => void
  onUploadError?: (error: string) => void
  /** @default 2000 */
  initialPollInterval?: number
  /** @default 3 */
  maxRetries?: number
}

export function useVideoUpload({
  onUploadComplete,
  onUploadError,
  initialPollInterval = INITIAL_POLL_INTERVAL,
  maxRetries = MAX_RETRIES
}: UseVideoUploadOptions = {}) {
  const [status, setStatus] = useState<VideoUploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | undefined>()
  const [videoId, setVideoId] = useState<string | undefined>()

  const uploadInstanceRef = useRef<{ abort: () => void } | null>(null)
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)

  const [createMuxVideoUploadByFile] = useMutation(
    CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
  )

  const [getMyMuxVideo] = useLazyQuery(GET_MY_MUX_VIDEO_QUERY, {
    fetchPolicy: 'network-only'
  })

  const clearPolling = useCallback(() => {
    if (pollingTimeoutRef.current != null) {
      clearTimeout(pollingTimeoutRef.current)
      pollingTimeoutRef.current = null
    }
    retryCountRef.current = 0
  }, [])

  const cancelUpload = useCallback(() => {
    uploadInstanceRef.current?.abort()
    uploadInstanceRef.current = null
    clearPolling()
    setStatus('idle')
    setProgress(0)
    setError(undefined)
    setVideoId(undefined)
  }, [clearPolling])

  const startPolling = useCallback(
    (videoId: string) => {
      setStatus('processing')

      const poll = async (delay: number) => {
        try {
          const result = await getMyMuxVideo({
            variables: { id: videoId }
          })

          if (result.error != null) {
            throw result.error
          }

          if (result.data?.getMyMuxVideo?.readyToStream === true) {
            clearPolling()
            setStatus('completed')
            onUploadComplete?.(videoId)
            return
          }

          // Reset retries on successful query (even if not ready)
          retryCountRef.current = 0

          // Schedule next poll with exponential backoff
          const nextDelay = Math.min(delay * 1.5, MAX_POLL_INTERVAL)
          pollingTimeoutRef.current = setTimeout(() => {
            void poll(nextDelay)
          }, delay)
        } catch (err) {
          // Retry on recoverable errors (e.g., network issues or 500s)
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++
            pollingTimeoutRef.current = setTimeout(() => {
              void poll(delay)
            }, delay)
            return
          }

          clearPolling()
          setStatus('error')
          setError('Failed to check video status')
          onUploadError?.('Failed to check video status')
        }
      }

      void poll(initialPollInterval)
    },
    [
      clearPolling,
      getMyMuxVideo,
      onUploadComplete,
      onUploadError,
      initialPollInterval,
      maxRetries
    ]
  )

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_VIDEO_SIZE) {
        const message = 'File is too large. Max size is 1GB.'
        setStatus('error')
        setError(message)
        onUploadError?.(message)
        return
      }

      setStatus('uploading')
      setProgress(0)
      setError(undefined)

      try {
        const { data, errors } = await createMuxVideoUploadByFile({
          variables: { name: file.name }
        })
        if (errors != null && errors.length > 0) {
          const message = errors[0]?.message ?? 'Upload failed'
          throw new Error(message)
        }

        const uploadUrl = data?.createMuxVideoUploadByFile?.uploadUrl
        const videoId = data?.createMuxVideoUploadByFile?.id
        setVideoId(videoId)

        if (uploadUrl == null || videoId == null) {
          throw new Error('Failed to create upload URL')
        }

        const upload = UpChunk.createUpload({
          endpoint: uploadUrl,
          file,
          chunkSize: 5120 // 5MB
        })

        uploadInstanceRef.current = upload

        upload.on('progress', (progress) => {
          setProgress(progress.detail)
        })

        upload.on('success', () => {
          uploadInstanceRef.current = null
          startPolling(videoId)
        })

        upload.on('error', () => {
          setStatus('error')
          setError('Upload failed')
          onUploadError?.('Upload failed')
        })
      } catch (err) {
        setStatus('error')
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        onUploadError?.(message)
      }
    },
    [createMuxVideoUploadByFile, startPolling, onUploadError]
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDropAccepted: (files) => {
      void handleUpload(files[0])
    },
    noDrag: true,
    multiple: false,
    accept: { 'video/*': [] },
    disabled: status !== 'idle' && status !== 'error' && status !== 'completed'
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      uploadInstanceRef.current?.abort()
      if (pollingTimeoutRef.current != null) {
        clearTimeout(pollingTimeoutRef.current)
      }
    }
  }, [])

  return {
    handleUpload,
    cancelUpload,
    status,
    progress,
    error,
    videoId,
    open,
    getInputProps,
    getRootProps
  }
}

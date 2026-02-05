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

const POLL_INTERVAL = 5000 // 5 seconds
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
}

export function useVideoUpload({
  onUploadComplete,
  onUploadError
}: UseVideoUploadOptions = {}) {
  const [status, setStatus] = useState<VideoUploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | undefined>()
  const [videoId, setVideoId] = useState<string | undefined>()

  const uploadInstanceRef = useRef<{ abort: () => void } | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [createMuxVideoUploadByFile] = useMutation(
    CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
  )

  const [getMyMuxVideo] = useLazyQuery(GET_MY_MUX_VIDEO_QUERY, {
    fetchPolicy: 'network-only'
  })

  const clearPolling = useCallback(() => {
    if (pollingIntervalRef.current != null) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  const cancelUpload = useCallback(() => {
    uploadInstanceRef.current?.abort()
    uploadInstanceRef.current = null
    clearPolling()
    setStatus('idle')
    setProgress(0)
    setError(undefined)
  }, [clearPolling])

  const startPolling = useCallback(
    (videoId: string) => {
      setStatus('processing')

      const poll = async () => {
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
          }
        } catch (err) {
          clearPolling()
          setStatus('error')
          setError('Failed to check video status')
          onUploadError?.('Failed to check video status')
        }
      }

      void poll()
      pollingIntervalRef.current = setInterval(poll, POLL_INTERVAL)
    },
    [clearPolling, getMyMuxVideo, onUploadComplete, onUploadError]
  )

  const handleUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_VIDEO_SIZE) {
        setError('File is too large. Max size is 1GB.')
        return
      }

      setStatus('uploading')
      setProgress(0)
      setError(undefined)

      try {
        const { data } = await createMuxVideoUploadByFile({
          variables: { name: file.name }
        })

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
      if (pollingIntervalRef.current != null) {
        clearInterval(pollingIntervalRef.current)
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

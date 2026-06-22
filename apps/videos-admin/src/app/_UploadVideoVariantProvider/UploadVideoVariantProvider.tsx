'use client'

import { gql, useApolloClient, useLazyQuery, useMutation } from '@apollo/client'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { ReactNode, createContext, useContext, useReducer, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { getExtension } from '../(dashboard)/videos/[videoId]/audio/add/_utils/getExtension'
import { refreshToken } from '../../app/api'

export const START_VIDEO_VARIANT_UPLOAD = gql`
  mutation StartVideoVariantUpload($input: VideoVariantUploadStartInput!) {
    videoVariantUploadStart(input: $input) {
      id
      status
    }
  }
`

export const MARK_VIDEO_VARIANT_UPLOAD_R2_PREPARED = gql`
  mutation MarkVideoVariantUploadR2Prepared($id: ID!, $r2AssetId: ID!) {
    videoVariantUploadMarkR2Prepared(id: $id, r2AssetId: $r2AssetId) {
      id
      status
      r2AssetId
    }
  }
`

export const MARK_VIDEO_VARIANT_UPLOAD_R2_COMPLETE = gql`
  mutation MarkVideoVariantUploadR2Complete($id: ID!) {
    videoVariantUploadMarkR2Complete(id: $id) {
      id
      status
    }
  }
`

export const CREATE_VIDEO_VARIANT_UPLOAD_MUX = gql`
  mutation CreateVideoVariantUploadMux(
    $id: ID!
    $downloadable: Boolean
    $maxResolution: MaxResolutionTier
  ) {
    videoVariantUploadCreateMux(
      id: $id
      downloadable: $downloadable
      maxResolution: $maxResolution
    ) {
      id
      status
      muxVideoId
    }
  }
`

export const GET_VIDEO_VARIANT_UPLOAD = gql`
  query GetVideoVariantUpload($id: ID!) {
    videoVariantUpload(id: $id) {
      id
      status
      errorMessage
      muxVideoId
      videoVariantId
      videoVariant {
        id
        videoId
        slug
        hls
        language {
          id
          slug
          name {
            value
            primary
          }
        }
      }
    }
  }
`

export const PREPARE_R2_MULTIPART = gql`
  mutation PrepareCloudflareR2Multipart(
    $input: CloudflareR2MultipartPrepareInput!
  ) {
    cloudflareR2MultipartPrepare(input: $input) {
      id
      uploadId
      fileName
      publicUrl
      partSize
      parts {
        partNumber
        uploadUrl
      }
    }
  }
`

export const COMPLETE_R2_MULTIPART = gql`
  mutation CloudflareR2CompleteMultipart(
    $input: CloudflareR2CompleteMultipartInput!
  ) {
    cloudflareR2CompleteMultipart(input: $input) {
      id
      fileName
      publicUrl
    }
  }
`

interface UploadVideoVariantState {
  isUploading: boolean
  uploadProgress: number
  uploadedBytes: number
  totalBytes: number
  uploadSpeedBps: number | null
  etaSeconds: number | null
  isProcessing: boolean
  error: string | null
  uploadId: string | null
  muxVideoId: string | null
  uploadStatus: string | null
  edition: string | null
  languageId: string | null
  languageSlug: string | null
  videoId: string | null
  videoSlug: string | null
  published: boolean | null
  onComplete?: () => void
}

interface UploadVideoVariantContextType {
  uploadState: UploadVideoVariantState
  startUpload: (
    file: File,
    videoId: string,
    languageId: string,
    languageSlug: string,
    edition: string,
    published: boolean,
    videoSlug?: string,
    onComplete?: () => void
  ) => Promise<void>
  clearUploadState: () => void
}

const initialState: UploadVideoVariantState = {
  isUploading: false,
  uploadProgress: 0,
  uploadedBytes: 0,
  totalBytes: 0,
  uploadSpeedBps: null,
  etaSeconds: null,
  isProcessing: false,
  error: null,
  uploadId: null,
  muxVideoId: null,
  uploadStatus: null,
  edition: null,
  languageId: null,
  languageSlug: null,
  videoId: null,
  videoSlug: null,
  published: null,
  onComplete: undefined
}

const UploadVideoVariantContext = createContext<
  UploadVideoVariantContextType | undefined
>(undefined)

const MIN_MULTIPART_PART_SIZE = 5 * 1024 * 1024
const DEFAULT_MULTIPART_PART_SIZE = 64 * 1024 * 1024
const MAX_MULTIPART_PARTS = 10000

interface BrowserVideoMetadata {
  duration: number
  durationMs: number
  width: number
  height: number
}

function calculateMultipartPartSize(fileSize: number): number {
  if (fileSize <= DEFAULT_MULTIPART_PART_SIZE) {
    return Math.max(fileSize, MIN_MULTIPART_PART_SIZE)
  }

  const partsWithDefault = Math.ceil(fileSize / DEFAULT_MULTIPART_PART_SIZE)
  if (partsWithDefault <= MAX_MULTIPART_PARTS)
    return DEFAULT_MULTIPART_PART_SIZE

  const sizedForMaxParts = Math.ceil(fileSize / MAX_MULTIPART_PARTS)
  return Math.max(MIN_MULTIPART_PART_SIZE, sizedForMaxParts)
}

function isValidVideoMetadata(metadata: BrowserVideoMetadata): boolean {
  return (
    Number.isFinite(metadata.duration) &&
    Number.isFinite(metadata.durationMs) &&
    Number.isFinite(metadata.width) &&
    Number.isFinite(metadata.height) &&
    metadata.duration > 0 &&
    metadata.durationMs > 0 &&
    metadata.width > 0 &&
    metadata.height > 0
  )
}

async function readBrowserVideoMetadata(
  file: File
): Promise<BrowserVideoMetadata> {
  if (typeof document === 'undefined' || typeof URL === 'undefined') {
    throw new Error('Video metadata can only be read in the browser')
  }

  const objectUrl = URL.createObjectURL(file)
  const video = document.createElement('video')

  try {
    const metadata = await new Promise<BrowserVideoMetadata>(
      (resolve, reject) => {
        video.preload = 'metadata'
        video.onloadedmetadata = () => {
          const duration = Math.round(video.duration)
          const durationMs = Math.round(video.duration * 1000)
          const width = video.videoWidth
          const height = video.videoHeight

          resolve({ duration, durationMs, width, height })
        }
        video.onerror = () => {
          reject(new Error('Unable to read video metadata'))
        }
        video.src = objectUrl
      }
    )

    if (!isValidVideoMetadata(metadata)) {
      throw new Error('Video metadata is missing duration or dimensions')
    }

    return metadata
  } finally {
    video.removeAttribute('src')
    video.load()
    URL.revokeObjectURL(objectUrl)
  }
}

type UploadAction =
  | {
      type: 'START_UPLOAD'
      videoId: string
      languageId: string
      languageSlug: string
      edition: string
      published: boolean
      onComplete?: () => void
      videoSlug?: string
      uploadId?: string | null
      totalBytes: number
    }
  | {
      type: 'SET_PROGRESS'
      progress: number
      uploadedBytes?: number
      uploadSpeedBps?: number | null
      etaSeconds?: number | null
    }
  | { type: 'START_PROCESSING'; uploadId: string; muxVideoId?: string | null }
  | { type: 'COMPLETE' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'CLEAR' }

function uploadReducer(
  state: UploadVideoVariantState,
  action: UploadAction
): UploadVideoVariantState {
  switch (action.type) {
    case 'START_UPLOAD':
      return {
        ...initialState,
        isUploading: true,
        uploadedBytes: 0,
        totalBytes: action.totalBytes,
        uploadSpeedBps: null,
        etaSeconds: null,
        videoId: action.videoId,
        languageId: action.languageId,
        languageSlug: action.languageSlug,
        edition: action.edition,
        published: action.published,
        uploadId: action.uploadId ?? null,
        onComplete: action.onComplete,
        videoSlug: action.videoSlug ?? null
      }
    case 'SET_PROGRESS':
      return {
        ...state,
        uploadProgress: action.progress,
        uploadedBytes: action.uploadedBytes ?? state.uploadedBytes,
        uploadSpeedBps:
          action.uploadSpeedBps !== undefined
            ? action.uploadSpeedBps
            : state.uploadSpeedBps,
        etaSeconds:
          action.etaSeconds !== undefined ? action.etaSeconds : state.etaSeconds
      }
    case 'START_PROCESSING':
      return {
        ...state,
        isUploading: false,
        isProcessing: true,
        uploadId: action.uploadId,
        muxVideoId: action.muxVideoId ?? state.muxVideoId,
        uploadStatus: 'muxCreated'
      }
    case 'COMPLETE':
      return initialState
    case 'SET_ERROR':
      return { ...initialState, error: action.error }
    case 'CLEAR':
      return { ...state, error: null }
    default:
      return state
  }
}

export function UploadVideoVariantProvider({
  children
}: {
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(uploadReducer, initialState)
  const apolloClient = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const authRefreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  )

  const dispatchError = (errorMessage: string) => {
    dispatch({ type: 'SET_ERROR', error: errorMessage })
    enqueueSnackbar(errorMessage, { variant: 'error' })
  }

  const stopUploadAuthRefresh = () => {
    if (authRefreshIntervalRef.current == null) return

    clearInterval(authRefreshIntervalRef.current)
    authRefreshIntervalRef.current = null
  }

  const syncUploadAuthToken = async () => {
    const refreshedToken = await refreshToken()

    if (refreshedToken == null) return false

    apolloClient.defaultContext.token = refreshedToken
    return true
  }

  const requireUploadAuthToken = async () => {
    if (await syncUploadAuthToken()) return

    throw new Error('Unable to refresh authentication for video upload')
  }

  const startUploadAuthRefresh = () => {
    stopUploadAuthRefresh()

    authRefreshIntervalRef.current = setInterval(() => {
      void syncUploadAuthToken().catch((error) => {
        console.warn('Failed to refresh upload auth token', { error })
      })
    }, 45000)
  }

  const [prepareR2Multipart] = useMutation(PREPARE_R2_MULTIPART)
  const [completeR2Multipart] = useMutation(COMPLETE_R2_MULTIPART)
  const [startVideoVariantUpload] = useMutation(START_VIDEO_VARIANT_UPLOAD)
  const [markVideoVariantUploadR2Prepared] = useMutation(
    MARK_VIDEO_VARIANT_UPLOAD_R2_PREPARED
  )
  const [markVideoVariantUploadR2Complete] = useMutation(
    MARK_VIDEO_VARIANT_UPLOAD_R2_COMPLETE
  )
  const [createVideoVariantUploadMux] = useMutation(
    CREATE_VIDEO_VARIANT_UPLOAD_MUX
  )
  const [getVideoVariantUpload, { stopPolling }] = useLazyQuery(
    GET_VIDEO_VARIANT_UPLOAD,
    {
      pollInterval: 2000,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        const upload = data.videoVariantUpload

        if (upload.status === 'variantCreated') {
          stopPolling()
          stopUploadAuthRefresh()
          state.onComplete?.()
          dispatch({ type: 'COMPLETE' })
          enqueueSnackbar('Audio Language Added', { variant: 'success' })
          return
        }

        if (upload.status === 'failed') {
          stopPolling()
          stopUploadAuthRefresh()
          dispatchError(upload.errorMessage ?? 'Video upload processing failed')
        }
      },
      onError: (error) => {
        stopPolling()
        stopUploadAuthRefresh()
        dispatchError(error.message || 'Failed to get video upload status')
      }
    }
  )

  const startUpload = async (
    file: File,
    videoId: string,
    languageId: string,
    languageSlug: string,
    edition: string,
    published: boolean,
    videoSlug?: string,
    onComplete?: () => void
  ) => {
    const uploadTraceId = uuidv4()
    const logContext = {
      uploadTraceId,
      videoId,
      languageId,
      edition,
      fileName: file.name,
      fileSize: file.size
    }
    let isPollingMuxVideo = false

    try {
      console.info('Starting video upload', logContext)
      await syncUploadAuthToken()
      startUploadAuthRefresh()
      const metadata = await readBrowserVideoMetadata(file)
      await requireUploadAuthToken()
      const uploadResponse = await startVideoVariantUpload({
        variables: {
          input: {
            source: 'videos-admin',
            sourceKey: uploadTraceId,
            videoId,
            edition,
            languageId,
            version: 1,
            published,
            originalFilename: file.name,
            contentType: file.type,
            contentLength: file.size,
            duration: metadata.duration,
            durationMs: metadata.durationMs,
            width: metadata.width,
            height: metadata.height
          }
        }
      })
      const uploadId = uploadResponse.data?.videoVariantUploadStart?.id
      if (uploadId == null) {
        dispatchError('Failed to start video upload lifecycle')
        return
      }

      dispatch({
        type: 'START_UPLOAD',
        videoId,
        languageId,
        languageSlug,
        edition,
        published,
        uploadId,
        onComplete,
        videoSlug,
        totalBytes: file.size
      })

      const videoVariantId = `${languageId}_${videoId}`
      const extension = getExtension(file.name)
      const fileName = `${videoId}/variants/${languageId}/videos/${uuidv4()}/${videoVariantId}${extension}`
      console.info('Preparing R2 multipart upload', {
        ...logContext,
        r2FileName: fileName
      })
      await requireUploadAuthToken()
      const r2Response = await prepareR2Multipart({
        variables: {
          input: {
            fileName,
            contentType: file.type,
            originalFilename: file.name,
            contentLength: file.size,
            videoId
          }
        }
      })

      const multipartData = r2Response.data?.cloudflareR2MultipartPrepare

      if (
        multipartData?.uploadId == null ||
        multipartData?.publicUrl == null ||
        multipartData?.parts == null
      ) {
        console.error('Failed to prepare R2 multipart upload', {
          ...logContext,
          r2FileName: fileName
        })
        dispatchError('Failed to prepare R2 multipart upload')
        return
      }
      console.info('R2 multipart upload prepared', {
        ...logContext,
        r2FileName: multipartData.fileName,
        r2UploadId: multipartData.uploadId,
        partCount: multipartData.parts.length
      })

      await requireUploadAuthToken()
      await markVideoVariantUploadR2Prepared({
        variables: {
          id: uploadId,
          r2AssetId: multipartData.id
        }
      })

      const partSize =
        multipartData.partSize ?? calculateMultipartPartSize(file.size)
      const parts = multipartData.parts

      if (parts.length === 0) {
        console.error('R2 multipart upload has no parts', {
          ...logContext,
          r2FileName: multipartData.fileName,
          r2UploadId: multipartData.uploadId
        })
        dispatchError('Failed to prepare R2 multipart upload')
        return
      }

      const abortController = new AbortController()
      const uploadedParts: Array<{ partNumber: number; eTag: string }> = []
      const totalSize = file.size
      let uploadedBytes = 0
      let lastProgressTime = Date.now()
      let lastProgressUploaded = 0

      try {
        const sortedParts = [...parts].sort(
          (first, second) => first.partNumber - second.partNumber
        )

        const uploadPartWithRetry = async (
          uploadUrl: string,
          chunk: Blob,
          partNumber: number
        ) => {
          const maxRetries = 3
          let attempt = 0

          while (attempt < maxRetries) {
            try {
              lastProgressUploaded = uploadedBytes
              lastProgressTime = Date.now()

              return await axios.put(uploadUrl, chunk, {
                headers: {
                  'Content-Type': file.type
                },
                signal: abortController.signal as unknown as AbortSignal,
                onUploadProgress: (progressEvent) => {
                  const loaded = progressEvent.loaded ?? 0
                  const totalUploaded = uploadedBytes + loaded
                  const percentCompleted = Math.round(
                    (totalUploaded * 100) / totalSize
                  )

                  const now = Date.now()
                  const deltaBytes = totalUploaded - lastProgressUploaded
                  const deltaTimeMs = now - lastProgressTime
                  const speedBps =
                    deltaTimeMs > 0 ? (deltaBytes * 1000) / deltaTimeMs : null
                  const etaSeconds =
                    speedBps != null && speedBps > 0
                      ? Math.max(0, (totalSize - totalUploaded) / speedBps)
                      : null

                  dispatch({
                    type: 'SET_PROGRESS',
                    progress: percentCompleted,
                    uploadedBytes: totalUploaded,
                    uploadSpeedBps: speedBps,
                    etaSeconds
                  })

                  lastProgressUploaded = totalUploaded
                  lastProgressTime = now
                }
              })
            } catch (error) {
              attempt += 1
              if (attempt >= maxRetries) {
                console.error('R2 part upload failed', {
                  ...logContext,
                  r2FileName: multipartData.fileName,
                  r2UploadId: multipartData.uploadId,
                  partNumber,
                  attempts: attempt,
                  error
                })
                const message =
                  error instanceof Error ? error.message : 'Unknown error'
                throw new Error(
                  `Failed to upload part ${partNumber} after ${maxRetries} attempts: ${message}`
                )
              }
              console.warn('Retrying R2 part upload', {
                ...logContext,
                r2FileName: multipartData.fileName,
                r2UploadId: multipartData.uploadId,
                partNumber,
                attempt,
                maxRetries
              })
              await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
            }
          }

          throw new Error(`Failed to upload part ${partNumber}`)
        }

        for (const part of sortedParts) {
          const start = (part.partNumber - 1) * partSize
          if (start >= file.size) break

          const end = Math.min(start + partSize, file.size)
          const chunk = file.slice(start, end)

          if (part.uploadUrl == null) {
            throw new Error(`Missing upload URL for part ${part.partNumber}`)
          }

          const uploadResult = await uploadPartWithRetry(
            part.uploadUrl,
            chunk,
            part.partNumber
          )

          const headers = uploadResult.headers as Record<
            string,
            string | string[] | undefined
          > &
            Partial<{ get: (name: string) => string | null }>

          const eTagHeader =
            headers?.etag ??
            headers?.ETag ??
            headers?.ETAG ??
            headers?.['ETag'] ??
            headers?.get?.('etag') ??
            headers?.get?.('ETag')

          if (eTagHeader == null) {
            const availableHeaders = headers
              ? Object.keys(headers).join(', ')
              : 'none'
            throw new Error(
              `Missing ETag for part ${part.partNumber}. Available headers: ${availableHeaders}`
            )
          }

          uploadedBytes += chunk.size
          dispatch({
            type: 'SET_PROGRESS',
            progress: Math.round((uploadedBytes * 100) / totalSize),
            uploadedBytes
          })

          uploadedParts.push({
            partNumber: part.partNumber,
            eTag: Array.isArray(eTagHeader)
              ? eTagHeader[0].replace(/"/g, '')
              : eTagHeader.replace(/"/g, '')
          })
        }
      } finally {
        abortController.abort()
      }

      if (uploadedParts.length === 0) {
        console.error('No parts uploaded to R2', {
          ...logContext,
          r2FileName: multipartData.fileName,
          r2UploadId: multipartData.uploadId
        })
        throw new Error('No parts uploaded to R2')
      }

      console.info('Completing R2 multipart upload', {
        ...logContext,
        r2FileName: multipartData.fileName,
        r2UploadId: multipartData.uploadId
      })
      await requireUploadAuthToken()
      await completeR2Multipart({
        variables: {
          input: {
            id: multipartData.id,
            fileName: multipartData.fileName,
            uploadId: multipartData.uploadId,
            parts: uploadedParts
          }
        }
      })
      console.info('R2 multipart upload completed', {
        ...logContext,
        r2FileName: multipartData.fileName,
        r2UploadId: multipartData.uploadId
      })

      await requireUploadAuthToken()
      await markVideoVariantUploadR2Complete({
        variables: { id: uploadId }
      })

      const muxResponse = await createVideoVariantUploadMux({
        variables: {
          id: uploadId,
          downloadable: true,
          maxResolution: 'uhd'
        }
      })

      if (muxResponse.data?.videoVariantUploadCreateMux?.id == null) {
        console.error('Failed to create Mux video', {
          ...logContext,
          uploadId,
          r2FileName: multipartData.fileName
        })
        dispatchError('Failed to create Mux video')
        return
      }

      dispatch({
        type: 'START_PROCESSING',
        uploadId,
        muxVideoId: muxResponse.data.videoVariantUploadCreateMux.muxVideoId
      })
      console.info('Mux video created, polling upload lifecycle', {
        ...logContext,
        uploadId,
        muxVideoId: muxResponse.data.videoVariantUploadCreateMux.muxVideoId
      })

      await requireUploadAuthToken()
      void getVideoVariantUpload({ variables: { id: uploadId } })
      isPollingMuxVideo = true
    } catch (error) {
      stopUploadAuthRefresh()
      const errorMessage =
        (error instanceof Error && error.message) || 'Failed to upload video'
      console.error('Video upload failed', { ...logContext, error })
      dispatchError(errorMessage)
    } finally {
      if (!isPollingMuxVideo) {
        stopUploadAuthRefresh()
      }
    }
  }

  const clearUploadState = () => {
    dispatch({ type: 'CLEAR' })
  }

  return (
    <UploadVideoVariantContext.Provider
      value={{
        uploadState: state,
        startUpload,
        clearUploadState
      }}
    >
      {children}
    </UploadVideoVariantContext.Provider>
  )
}

export function useUploadVideoVariant() {
  const context = useContext(UploadVideoVariantContext)
  if (context === undefined) {
    throw new Error(
      'useUploadVideoVariant must be used within a UploadVideoVariantProvider'
    )
  }
  return context
}

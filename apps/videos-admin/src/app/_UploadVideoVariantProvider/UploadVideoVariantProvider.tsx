'use client'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { ReactNode, createContext, useContext, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { graphql } from '@core/shared/gql'

import { getExtension } from '../(dashboard)/videos/[videoId]/audio/add/_utils/getExtension'
import { refreshToken } from '../../app/api'

export const CREATE_MUX_VIDEO_UPLOAD_BY_URL = graphql(`
  mutation CreateMuxVideoUploadByUrl(
    $url: String!
    $userGenerated: Boolean
    $downloadable: Boolean
    $maxResolution: MaxResolutionTier
  ) {
    createMuxVideoUploadByUrl(
      url: $url
      userGenerated: $userGenerated
      downloadable: $downloadable
      maxResolution: $maxResolution
    ) {
      id
      assetId
      playbackId
      uploadUrl
      readyToStream
    }
  }
`)

export const CREATE_VIDEO_VARIANT = graphql(`
  mutation CreateVideoVariant($input: VideoVariantCreateInput!) {
    videoVariantCreate(input: $input) {
      id
      videoId
      slug
      hls
      published
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
`)

export const GET_MY_MUX_VIDEO = graphql(`
  query GetMyMuxVideo($id: ID!, $userGenerated: Boolean) {
    getMyMuxVideo(id: $id, userGenerated: $userGenerated) {
      id
      assetId
      playbackId
      readyToStream
      duration
    }
  }
`)

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
  muxVideoId: string | null
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
  muxVideoId: null,
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
      totalBytes: number
    }
  | {
      type: 'SET_PROGRESS'
      progress: number
      uploadedBytes?: number
      uploadSpeedBps?: number | null
      etaSeconds?: number | null
    }
  | { type: 'START_PROCESSING'; muxVideoId: string }
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
        muxVideoId: action.muxVideoId
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
  const { enqueueSnackbar } = useSnackbar()

  const dispatchError = (errorMessage: string) => {
    dispatch({ type: 'SET_ERROR', error: errorMessage })
    enqueueSnackbar(errorMessage, { variant: 'error' })
  }

  const [prepareR2Multipart] = useMutation(PREPARE_R2_MULTIPART)
  const [completeR2Multipart] = useMutation(COMPLETE_R2_MULTIPART)
  const [createMuxVideo] = useMutation(CREATE_MUX_VIDEO_UPLOAD_BY_URL)
  const [createVideoVariant] = useMutation(CREATE_VIDEO_VARIANT)
  const [getMyMuxVideo, { stopPolling }] = useLazyQuery(GET_MY_MUX_VIDEO, {
    pollInterval: 1000,
    notifyOnNetworkStatusChange: true,
    onCompleted: async (data) => {
      if (
        data.getMyMuxVideo.playbackId != null &&
        data.getMyMuxVideo.assetId != null &&
        data.getMyMuxVideo.readyToStream &&
        state.muxVideoId != null
      ) {
        stopPolling()
        console.info('Mux video ready, creating video variant', {
          muxVideoId: data.getMyMuxVideo.id,
          assetId: data.getMyMuxVideo.assetId,
          playbackId: data.getMyMuxVideo.playbackId,
          duration: data.getMyMuxVideo.duration
        })
        await handleCreateVideoVariant(
          data.getMyMuxVideo.id,
          data.getMyMuxVideo.playbackId,
          data.getMyMuxVideo.duration
        )
      }
    },
    onError: (error) => {
      stopPolling()
      const errorMessage = error.message || 'Failed to get Mux video status'
      dispatchError(errorMessage)
    }
  })

  const handleCreateVideoVariant = async (
    muxId: string,
    playbackId: string,
    duration?: number | null
  ) => {
    const variantContext = {
      muxId,
      playbackId,
      duration,
      videoId: state.videoId,
      languageId: state.languageId,
      languageSlug: state.languageSlug,
      edition: state.edition,
      videoSlug: state.videoSlug
    }

    if (
      state.videoId == null ||
      state.languageId == null ||
      state.languageSlug == null ||
      state.edition == null ||
      state.videoSlug == null
    ) {
      const missingFields = [
        state.videoId == null && 'videoId',
        state.languageId == null && 'languageId',
        state.languageSlug == null && 'languageSlug',
        state.edition == null && 'edition',
        state.videoSlug == null && 'videoSlug'
      ].filter(Boolean)

      const errorMessage = `Failed to create video variant: missing required fields (${missingFields.join(', ')})`
      console.error(errorMessage, variantContext)
      dispatchError(errorMessage)
      return
    }

    const durationInSeconds = duration ?? 0

    const variantInput = {
      id: `${state.languageId}_${state.videoId}`,
      videoId: state.videoId,
      edition: state.edition,
      languageId: state.languageId,
      slug: `${state.videoSlug}/${state.languageSlug}`,
      downloadable: true,
      published: state.published ?? false,
      muxVideoId: muxId,
      hls: `https://stream.mux.com/${playbackId}.m3u8`,
      duration: durationInSeconds,
      lengthInMilliseconds: durationInSeconds * 1000
    }

    console.info('Creating video variant', {
      ...variantContext,
      variantId: variantInput.id,
      slug: variantInput.slug
    })

    try {
      const result = await createVideoVariant({
        variables: {
          input: variantInput
        },
        onCompleted: () => {
          state.onComplete?.()
        },
        update: (cache, { data }) => {
          if (data?.videoVariantCreate == null || state.videoId == null) return
          cache.modify({
            id: cache.identify({
              __typename: 'Video',
              id: state.videoId
            }),
            fields: {
              variants(existingVariants = []) {
                const newVariantRef = cache.writeFragment({
                  data: data.videoVariantCreate,
                  fragment: graphql(`
                    fragment NewVariant on VideoVariant {
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
                  `)
                })
                return [...existingVariants, newVariantRef]
              }
            }
          })
        }
      })

      if (result.errors != null && result.errors.length > 0) {
        const gqlErrors = result.errors.map((e) => e.message).join('; ')
        const errorMessage = `Failed to create video variant: ${gqlErrors}`
        console.error(errorMessage, {
          ...variantContext,
          graphqlErrors: result.errors
        })
        dispatchError(errorMessage)
        return
      }

      console.info('Video variant created successfully', {
        ...variantContext,
        variantId: variantInput.id
      })
      dispatch({ type: 'COMPLETE' })
      enqueueSnackbar('Audio Language Added', { variant: 'success' })
    } catch (error) {
      const errorMessage = `Failed to create video variant: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error(errorMessage, { ...variantContext, error })
      dispatchError(errorMessage)
    }
  }

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

    try {
      console.info('Starting video upload', logContext)
      dispatch({
        type: 'START_UPLOAD',
        videoId,
        languageId,
        languageSlug,
        edition,
        published,
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

      const keepAliveInterval = setInterval(() => {
        void refreshToken().catch(() => undefined)
      }, 45000)

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
        clearInterval(keepAliveInterval)
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

      const muxResponse = await createMuxVideo({
        variables: {
          url: multipartData.publicUrl,
          userGenerated: false,
          downloadable: true,
          maxResolution: 'uhd'
        }
      })

      if (muxResponse.data?.createMuxVideoUploadByUrl?.id == null) {
        console.error('Failed to create Mux video', {
          ...logContext,
          r2FileName: multipartData.fileName
        })
        dispatchError('Failed to create Mux video')
        return
      }

      dispatch({
        type: 'START_PROCESSING',
        muxVideoId: muxResponse.data.createMuxVideoUploadByUrl.id
      })
      console.info('Mux video created, polling for readiness', {
        ...logContext,
        muxVideoId: muxResponse.data.createMuxVideoUploadByUrl.id
      })

      // Start polling for Mux video status
      void getMyMuxVideo({
        variables: {
          id: muxResponse.data.createMuxVideoUploadByUrl.id,
          userGenerated: false
        }
      })
    } catch (error) {
      const errorMessage =
        (error instanceof Error && error.message) || 'Failed to upload video'
      console.error('Video upload failed', { ...logContext, error })
      dispatchError(errorMessage)
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

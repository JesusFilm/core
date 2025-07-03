'use client'

import { useLazyQuery, useMutation } from '@apollo/client'
import axios from 'axios'
import { graphql } from 'gql.tada'
import { useSnackbar } from 'notistack'
import { ReactNode, createContext, useContext, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { getExtension } from '../(dashboard)/videos/[videoId]/audio/add/_utils/getExtension'
import { useCreateR2AssetMutation } from '../../libs/useCreateR2Asset/useCreateR2Asset'

export const CREATE_MUX_VIDEO_UPLOAD_BY_URL = graphql(`
  mutation CreateMuxVideoUploadByUrl($url: String!, $userGenerated: Boolean) {
    createMuxVideoUploadByUrl(url: $url, userGenerated: $userGenerated) {
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

export const CREATE_VIDEO_VARIANT_DOWNLOAD = graphql(`
  mutation CreateVideoVariantDownload($input: VideoVariantDownloadCreateInput!) {
    videoVariantDownloadCreate(input: $input) {
      id
      quality
      url
      height
      width
      size
    }
  }
`)

export const ENABLE_MUX_DOWNLOAD = graphql(`
  mutation EnableMuxDownload($id: ID!, $resolution: String) {
    enableMuxDownload(id: $id, resolution: $resolution) {
      id
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

interface UploadVideoVariantState {
  isUploading: boolean
  uploadProgress: number
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
    }
  | { type: 'SET_PROGRESS'; progress: number }
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
        videoId: action.videoId,
        languageId: action.languageId,
        languageSlug: action.languageSlug,
        edition: action.edition,
        published: action.published,
        onComplete: action.onComplete,
        videoSlug: action.videoSlug ?? null
      }
    case 'SET_PROGRESS':
      return { ...state, uploadProgress: action.progress }
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

  const [createR2Asset] = useCreateR2AssetMutation()
  const [createMuxVideo] = useMutation(CREATE_MUX_VIDEO_UPLOAD_BY_URL)
  const [createVideoVariant] = useMutation(CREATE_VIDEO_VARIANT)
  const [createVideoVariantDownload] = useMutation(CREATE_VIDEO_VARIANT_DOWNLOAD)
  const [enableMuxDownload] = useMutation(ENABLE_MUX_DOWNLOAD)
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
      dispatch({ type: 'SET_ERROR', error: errorMessage })
      enqueueSnackbar(errorMessage, { variant: 'error' })
    }
  })

  const createStaticRenditions = async (
    videoVariantId: string,
    muxVideoId: string,
    playbackId: string
  ): Promise<void> => {
    try {
      // Enable Mux downloads for all required resolutions
      await Promise.all([
        enableMuxDownload({
          variables: { id: muxVideoId, resolution: '270p' }
        }),
        enableMuxDownload({
          variables: { id: muxVideoId, resolution: '360p' }
        }),
        enableMuxDownload({
          variables: { id: muxVideoId, resolution: '720p' }
        }),
        enableMuxDownload({
          variables: { id: muxVideoId, resolution: '1080p' }
        })
      ])

      // Create video variant downloads for all required qualities
      await Promise.all([
        createVideoVariantDownload({
          variables: {
            input: {
              videoVariantId: videoVariantId,
              quality: 'low',
              size: 0,
              height: 270,
              width: 480,
              url: `https://stream.mux.com/${playbackId}/270p.mp4`,
              version: 0
            }
          }
        }),
        createVideoVariantDownload({
          variables: {
            input: {
              videoVariantId: videoVariantId,
              quality: 'sd',
              size: 0,
              height: 360,
              width: 640,
              url: `https://stream.mux.com/${playbackId}/360p.mp4`,
              version: 0
            }
          }
        }),
        createVideoVariantDownload({
          variables: {
            input: {
              videoVariantId: videoVariantId,
              quality: 'high',
              size: 0,
              height: 720,
              width: 1280,
              url: `https://stream.mux.com/${playbackId}/720p.mp4`,
              version: 0
            }
          }
        }),
        createVideoVariantDownload({
          variables: {
            input: {
              videoVariantId: videoVariantId,
              quality: 'highest',
              size: 0,
              height: 1080,
              width: 1920,
              url: `https://stream.mux.com/${playbackId}/1080p.mp4`,
              version: 0
            }
          }
        })
      ])
    } catch (error) {
      // Log error but don't fail the entire process
      console.error('Failed to create static renditions:', error)
      enqueueSnackbar('Static renditions creation failed', { variant: 'warning' })
    }
  }

  const handleCreateVideoVariant = async (
    muxId: string,
    playbackId: string,
    duration?: number | null
  ) => {
    if (
      state.videoId == null ||
      state.languageId == null ||
      state.languageSlug == null ||
      state.edition == null ||
      state.videoSlug == null
    )
      return

    // Calculate lengthInMilliseconds from duration (duration is in seconds)
    const durationInSeconds = duration ?? 0
    const lengthInMilliseconds = durationInSeconds * 1000
    const videoVariantId = `${state.languageId}_${state.videoId}`

    try {
      await createVideoVariant({
        variables: {
          input: {
            id: videoVariantId,
            videoId: state.videoId,
            edition: state.edition,
            languageId: state.languageId,
            slug: `${state.videoSlug}/${state.languageSlug}`,
            downloadable: true,
            published: state.published ?? false,
            muxVideoId: muxId,
            hls: `https://stream.mux.com/${playbackId}.m3u8`,
            duration: durationInSeconds,
            lengthInMilliseconds: lengthInMilliseconds
          }
        },
        onCompleted: async () => {
          // Create static renditions after video variant is successfully created
          await createStaticRenditions(videoVariantId, muxId, playbackId)
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

      dispatch({ type: 'COMPLETE' })
      enqueueSnackbar('Audio Language Added', { variant: 'success' })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Processing failed'
      dispatch({ type: 'SET_ERROR', error: errorMessage })
      enqueueSnackbar(errorMessage, { variant: 'error' })
    }
  }

  const startUpload = async (
    file: File,
    videoId: string,
    languageId: string,
    languageSlug: string,
    edition: string,
    published: boolean,
    videoSlug: string,
    onComplete?: () => void
  ) => {
    try {
      dispatch({
        type: 'START_UPLOAD',
        videoId,
        languageId,
        languageSlug,
        edition,
        published,
        onComplete,
        videoSlug
      })

      const videoVariantId = `${languageId}_${videoId}`
      const extension = getExtension(file.name)
      // Create R2 asset
      const r2Response = await createR2Asset({
        variables: {
          input: {
            fileName: `${videoId}/variants/${languageId}/videos/${uuidv4()}/${videoVariantId}${extension}`,
            contentType: file.type,
            originalFilename: file.name,
            contentLength: file.size,
            videoId
          }
        }
      })

      if (
        r2Response.data?.cloudflareR2Create?.uploadUrl == null ||
        r2Response.data?.cloudflareR2Create?.publicUrl == null
      ) {
        const errorMessage = 'Failed to create R2 asset'
        dispatch({ type: 'SET_ERROR', error: errorMessage })
        enqueueSnackbar(errorMessage, { variant: 'error' })
        return
      }

      // Upload to R2 with progress tracking
      await axios.put(r2Response.data.cloudflareR2Create.uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
          )
          dispatch({ type: 'SET_PROGRESS', progress: percentCompleted })
        }
      })

      // Create Mux video
      const muxResponse = await createMuxVideo({
        variables: {
          url: r2Response.data.cloudflareR2Create.publicUrl,
          userGenerated: false
        }
      })

      if (muxResponse.data?.createMuxVideoUploadByUrl?.id == null) {
        const errorMessage = 'Failed to create Mux video'
        dispatch({ type: 'SET_ERROR', error: errorMessage })
        enqueueSnackbar(errorMessage, { variant: 'error' })
        return
      }

      dispatch({
        type: 'START_PROCESSING',
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
      let errorMessage: string

      if (error instanceof Error) {
        errorMessage = error.message || 'Failed to upload video'
      } else {
        errorMessage = 'Failed to upload video'
      }

      dispatch({ type: 'SET_ERROR', error: errorMessage })
      enqueueSnackbar(errorMessage, { variant: 'error' })
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

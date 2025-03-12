'use client'
import { useLazyQuery, useMutation } from '@apollo/client'
import axios from 'axios'
import { graphql } from 'gql.tada'
import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactNode, createContext, useContext, useReducer } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { getExtension } from '../../app/[locale]/(dashboard)/videos/[videoId]/_VideoView/Variants/AddAudioLanguageDialog/utils/getExtension'

export const CLOUDFLARE_R2_CREATE = graphql(`
  mutation CloudflareR2Create($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      id
      fileName
      uploadUrl
      publicUrl
    }
  }
`)

export const CREATE_MUX_VIDEO_UPLOAD_BY_URL = graphql(`
  mutation CreateMuxVideoUploadByUrl($url: String!) {
    createMuxVideoUploadByUrl(url: $url) {
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
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

export const GET_MY_MUX_VIDEO = graphql(`
  query GetMyMuxVideo($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
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
      onComplete?: () => void
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
        onComplete: action.onComplete
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
      return initialState
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
  const t = useTranslations()

  const [createR2Asset] = useMutation(CLOUDFLARE_R2_CREATE)
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
        await handleCreateVideoVariant(
          data.getMyMuxVideo.id,
          data.getMyMuxVideo.playbackId
        )
      }
    },
    onError: (error) => {
      stopPolling()
      const errorMessage = error.message || t('Failed to get Mux video status')
      dispatch({ type: 'SET_ERROR', error: errorMessage })
      enqueueSnackbar(errorMessage, { variant: 'error' })
    }
  })

  const handleCreateVideoVariant = async (
    muxId: string,
    playbackId: string
  ) => {
    if (
      state.videoId == null ||
      state.languageId == null ||
      state.languageSlug == null ||
      state.edition == null
    )
      return

    try {
      await createVideoVariant({
        variables: {
          input: {
            id: `${state.languageId}_${state.videoId}`,
            videoId: state.videoId,
            edition: state.edition,
            languageId: state.languageId,
            slug: `${state.videoId}/${state.languageSlug}`,
            downloadable: true,
            published: true,
            muxVideoId: muxId,
            hls: `https://stream.mux.com/${playbackId}.m3u8`
          }
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
      enqueueSnackbar(t('Audio Language Added'), { variant: 'success' })
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
    onComplete?: () => void
  ) => {
    try {
      dispatch({
        type: 'START_UPLOAD',
        videoId,
        languageId,
        languageSlug,
        edition,
        onComplete
      })

      const videoVariantId = `${languageId}_${videoId}`
      const extension = getExtension(file.name)
      // Create R2 asset
      const r2Response = await createR2Asset({
        variables: {
          input: {
            fileName: `${videoId}/variants/${languageId}/videos/${uuidv4()}/${videoVariantId}${extension}`,
            contentType: file.type,
            contentLength: file.size,
            videoId
          }
        }
      })

      if (
        r2Response.data?.cloudflareR2Create?.uploadUrl == null ||
        r2Response.data?.cloudflareR2Create?.publicUrl == null
      ) {
        const errorMessage = t('Failed to create R2 asset')
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
          url: r2Response.data.cloudflareR2Create.publicUrl
        }
      })

      if (muxResponse.data?.createMuxVideoUploadByUrl?.id == null) {
        const errorMessage = t('Failed to create Mux video')
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
        variables: { id: muxResponse.data.createMuxVideoUploadByUrl.id }
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed'
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

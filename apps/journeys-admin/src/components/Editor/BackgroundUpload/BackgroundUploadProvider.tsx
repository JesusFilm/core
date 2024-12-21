import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { UpChunk } from '@mux/upchunk'
import { produce } from 'immer'
import { ReactElement, ReactNode, useState } from 'react'

import { CreateMuxVideoUploadByFileMutation } from '../../../../__generated__/CreateMuxVideoUploadByFileMutation'
import { GetMyMuxVideoQuery } from '../../../../__generated__/GetMyMuxVideoQuery'
import { UpdateVideoBlockAfterMuxUpload } from '../../../../__generated__/UpdateVideoBlockAfterMuxUpload'

import {
  BackgroundUploadContext,
  Context,
  UploadQueueItem,
  UploadStatus,
  uploadMuxVideoParams
} from './BackgroundUploadContext'

interface BackgroundUploadProviderProps {
  children: ReactNode
  value?: Partial<Context>
}

export const CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation CreateMuxVideoUploadByFileMutation($name: String!) {
    createMuxVideoUploadByFile(name: $name) {
      uploadUrl
      id
      uploadId
    }
  }
`

export const GET_MY_MUX_VIDEO_QUERY = gql`
  query GetMyMuxVideoQuery($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      playbackId
      readyToStream
    }
  }
`

export const UPDATE_VIDEO_BLOCK_AFTER_MUX_UPLOAD = gql`
  mutation UpdateVideoBlockAfterMuxUpload(
    $id: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, input: $input) {
      id
      image
      mediaVideo {
        ... on MuxVideo {
          id
          playbackId
        }
      }
    }
  }
`

export function BackgroundUploadProvider({
  children
}: BackgroundUploadProviderProps): ReactElement {
  const [uploadQueue, setUploadQueue] = useState<
    Record<string, UploadQueueItem>
  >({})
  const [createMuxVideoUploadByFile] =
    useMutation<CreateMuxVideoUploadByFileMutation>(
      CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
    )

  const [updateVideoBlockAfterMuxUpload] =
    useMutation<UpdateVideoBlockAfterMuxUpload>(
      UPDATE_VIDEO_BLOCK_AFTER_MUX_UPLOAD
    )

  const [getMyMuxVideo, { stopPolling }] = useLazyQuery<GetMyMuxVideoQuery>(
    GET_MY_MUX_VIDEO_QUERY,
    {
      pollInterval: 1000,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        if (
          data.getMyMuxVideo?.readyToStream &&
          data.getMyMuxVideo?.playbackId != null &&
          data.getMyMuxVideo.id != null
        ) {
          stopPolling()
          if (uploadQueue[data.getMyMuxVideo.id] != null) {
            setUploadQueue(
              produce((draft) => {
                const upload = draft[data.getMyMuxVideo.id]
                if (upload != null) {
                  upload.status = UploadStatus.complete
                }
              })
            )
            const upload = uploadQueue[data.getMyMuxVideo.id]
            if (upload?.videoBlockId == null) return
            void updateVideoBlockAfterMuxUpload({
              variables: {
                id: uploadQueue[data.getMyMuxVideo.id].videoBlockId,
                input: {
                  videoId: data.getMyMuxVideo.id
                }
              }
            })
          }
        }
      }
    }
  )
  async function* uploadMuxVideo({
    files
  }: uploadMuxVideoParams): AsyncGenerator<string> {
    if (files.length > 0) {
      const file = files[0]
      const fileName = file.name.split('.')[0]
      const { data } = await createMuxVideoUploadByFile({
        variables: {
          name: fileName
        }
      })

      yield data?.createMuxVideoUploadByFile?.id ?? ''

      if (
        data?.createMuxVideoUploadByFile?.uploadUrl != null &&
        data?.createMuxVideoUploadByFile?.id != null
      ) {
        const id = data.createMuxVideoUploadByFile.id

        setUploadQueue(
          produce((draft) => {
            draft[id] = {
              id,
              fileName,
              status: UploadStatus.uploading
            }
          })
        )

        const upload = UpChunk.createUpload({
          file,
          endpoint: data.createMuxVideoUploadByFile.uploadUrl ?? '',
          chunkSize: 5120
        })
        upload.on('success', (): void => {
          setUploadQueue(
            produce((draft) => {
              const upload = draft[id]
              upload.status = UploadStatus.processing
            })
          )
          void getMyMuxVideo({
            variables: { id }
          })
        })
        upload.on('error', (err): void => {
          setUploadQueue(
            produce((draft) => {
              const upload = draft[id]
              upload.error = err.detail
              upload.status = UploadStatus.error
              upload.progress = 0
            })
          )
        })
        upload.on('progress', (progress): void => {
          setUploadQueue(
            produce((draft) => {
              const upload = draft[id]
              upload.progress = progress.detail
            })
          )
        })

        return id
      }
    }
    throw new Error('No file selected')
  }

  function setUpload(id: string, upload: Partial<UploadQueueItem>): void {
    setUploadQueue(
      produce((draft) => {
        const existing = draft[id]
        if (existing == null) return
        Object.assign(existing, { ...existing, ...upload })
      })
    )
  }
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false)

  const value = {
    uploadMenuOpen,
    setUploadMenuOpen,
    uploadMuxVideo,
    uploadQueue,
    setUpload,
    activeUploads: () =>
      Object.entries(uploadQueue).filter(
        ([id, item]) => item.status !== UploadStatus.complete
      ).length
  }
  return (
    <BackgroundUploadContext.Provider value={value}>
      {children}
    </BackgroundUploadContext.Provider>
  )
}

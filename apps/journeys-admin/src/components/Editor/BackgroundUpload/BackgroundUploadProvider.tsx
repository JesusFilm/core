import type { ReadStream } from 'fs'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { UpChunk } from '@mux/upchunk'
import { produce } from 'immer'
import { ReactElement, ReactNode, useState } from 'react'

import { CreateMuxVideoUploadByFileMutation } from '../../../../__generated__/CreateMuxVideoUploadByFileMutation'
import { GetMyMuxVideoQuery } from '../../../../__generated__/GetMyMuxVideoQuery'
import { RefreshVideoBlockImageQuery } from '../../../../__generated__/RefreshVideoBlockImageQuery'

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
      readyToStream
    }
  }
`

export const REFRESH_VIDEO_BLOCK_IMAGE_QUERY = gql`
  query RefreshVideoBlockImageQuery($id: ID!) {
    block(id: $id) {
      id
      ... on VideoBlock {
        image
        mediaVideo {
          ... on MuxVideo {
            id
            playbackId
          }
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

  const [refreshVideoBlockImage] = useLazyQuery<RefreshVideoBlockImageQuery>(
    REFRESH_VIDEO_BLOCK_IMAGE_QUERY
  )

  const [getMyMuxVideo, { stopPolling }] = useLazyQuery<GetMyMuxVideoQuery>(
    GET_MY_MUX_VIDEO_QUERY,
    {
      pollInterval: 1000,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        if (
          data.getMyMuxVideo?.readyToStream &&
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
            void refreshVideoBlockImage({
              variables: {
                id: uploadQueue[data.getMyMuxVideo.id].videoBlockId
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
          uploadLength: file.size,
          name: fileName
        }
      })

      yield data?.createMuxVideoUploadByFile?.id ?? ''

      if (
        data?.createMuxVideoUploadByFile?.uploadUrl != null &&
        data?.createMuxVideoUploadByFile?.id != null
      ) {
        const id = data.createMuxVideoUploadByFile.id
        const uploadUrl = data.createMuxVideoUploadByFile.uploadUrl
        let buffer: ReadStream | File
        if (process.env.NODE_ENV === 'test') {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          buffer = require('fs').createReadStream(
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('path').join(
              __dirname,
              (file as unknown as { path: string }).path
            )
          )
        } else {
          buffer = file
        }

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
              upload.progress = progress.detail * 100
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

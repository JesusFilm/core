import type { ReadStream } from 'fs'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { produce } from 'immer'
import { ReactElement, ReactNode, useState } from 'react'
import { DefaultHttpStack, Upload } from 'tus-js-client'

import { CreateCloudflareVideoUploadByFileMutation } from '../../../../__generated__/CreateCloudflareVideoUploadByFileMutation'
import { GetMyCloudflareVideoQuery } from '../../../../__generated__/GetMyCloudflareVideoQuery'
import { RefreshVideoBlockImageQuery } from '../../../../__generated__/RefreshVideoBlockImageQuery'

import {
  BackgroundUploadContext,
  Context,
  UploadQueueItem,
  UploadStatus,
  uploadCloudflareVideoParams
} from './BackgroundUploadContext'

interface BackgroundUploadProviderProps {
  children: ReactNode
  value?: Partial<Context>
}

export const CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation CreateCloudflareVideoUploadByFileMutation(
    $uploadLength: Int!
    $name: String!
  ) {
    createCloudflareVideoUploadByFile(
      uploadLength: $uploadLength
      name: $name
    ) {
      uploadUrl
      id
    }
  }
`

export const GET_MY_CLOUDFLARE_VIDEO_QUERY = gql`
  query GetMyCloudflareVideoQuery($id: ID!) {
    getMyCloudflareVideo(id: $id) {
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
  const [createCloudflareVideoUploadByFile] =
    useMutation<CreateCloudflareVideoUploadByFileMutation>(
      CREATE_CLOUDFLARE_VIDEO_UPLOAD_BY_FILE_MUTATION
    )

  const [refreshVideoBlockImage] = useLazyQuery<RefreshVideoBlockImageQuery>(
    REFRESH_VIDEO_BLOCK_IMAGE_QUERY
  )

  const [getMyCloudflareVideo, { stopPolling }] =
    useLazyQuery<GetMyCloudflareVideoQuery>(GET_MY_CLOUDFLARE_VIDEO_QUERY, {
      pollInterval: 1000,
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        if (
          data.getMyCloudflareVideo?.readyToStream &&
          data.getMyCloudflareVideo.id != null
        ) {
          stopPolling()
          if (uploadQueue[data.getMyCloudflareVideo.id] != null) {
            setUploadQueue(
              produce((draft) => {
                const upload = draft[data.getMyCloudflareVideo.id]
                if (upload != null) {
                  upload.status = UploadStatus.complete
                }
              })
            )
            const upload = uploadQueue[data.getMyCloudflareVideo.id]
            if (upload?.videoBlockId == null) return
            void refreshVideoBlockImage({
              variables: {
                id: uploadQueue[data.getMyCloudflareVideo.id].videoBlockId
              }
            })
          }
        }
      }
    })
  async function* uploadCloudflareVideo({
    files,
    httpStack = new DefaultHttpStack({})
  }: uploadCloudflareVideoParams): AsyncGenerator<string> {
    if (files.length > 0) {
      const file = files[0]
      const fileName = file.name.split('.')[0]
      const { data } = await createCloudflareVideoUploadByFile({
        variables: {
          uploadLength: file.size,
          name: fileName
        }
      })

      yield data?.createCloudflareVideoUploadByFile?.id ?? ''

      if (
        data?.createCloudflareVideoUploadByFile?.uploadUrl != null &&
        data?.createCloudflareVideoUploadByFile?.id != null
      ) {
        const id = data.createCloudflareVideoUploadByFile.id
        const uploadUrl = data.createCloudflareVideoUploadByFile.uploadUrl
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

        const upload = new Upload(buffer, {
          httpStack: httpStack ?? new DefaultHttpStack({}),
          uploadUrl,
          chunkSize: 150 * 1024 * 1024,
          onSuccess: (): void => {
            setUploadQueue(
              produce((draft) => {
                const upload = draft[id]
                upload.status = UploadStatus.processing
              })
            )
            void getMyCloudflareVideo({
              variables: { id }
            })
          },
          onError: (err): void => {
            setUploadQueue(
              produce((draft) => {
                const upload = draft[id]
                upload.error = err
                upload.status = UploadStatus.error
                upload.progress = 0
              })
            )
          },
          onProgress(bytesUploaded, bytesTotal): void {
            setUploadQueue(
              produce((draft) => {
                const upload = draft[id]
                upload.progress = (bytesUploaded / bytesTotal) * 100
              })
            )
          }
        })

        upload.start()

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
    uploadCloudflareVideo,
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

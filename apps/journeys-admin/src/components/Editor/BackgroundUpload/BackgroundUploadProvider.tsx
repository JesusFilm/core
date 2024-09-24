import type { ReadStream } from 'fs'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { ReactElement, ReactNode, useState } from 'react'
import { DefaultHttpStack, Upload } from 'tus-js-client'

import { CreateCloudflareVideoUploadByFileMutation } from '../../../../__generated__/CreateCloudflareVideoUploadByFileMutation'
import { GetMyCloudflareVideoQuery } from '../../../../__generated__/GetMyCloudflareVideoQuery'

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
            setUploadQueue({
              ...uploadQueue,
              [data.getMyCloudflareVideo.id]: {
                ...uploadQueue[data.getMyCloudflareVideo.id],
                status: UploadStatus.complete
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
        setUploadQueue({
          ...uploadQueue,
          [id]: {
            id,
            fileName,
            status: UploadStatus.uploading
          }
        })

        const upload = new Upload(buffer, {
          httpStack: httpStack ?? new DefaultHttpStack({}),
          uploadUrl,
          chunkSize: 150 * 1024 * 1024,
          onSuccess: (): void => {
            setUploadQueue({
              ...uploadQueue,
              [id]: {
                ...uploadQueue[id],
                status: UploadStatus.processing
              }
            })
            void getMyCloudflareVideo({
              variables: { id }
            })
          },
          onError: (err): void => {
            setUploadQueue({
              ...uploadQueue,
              [id]: {
                ...uploadQueue[id],
                error: err,
                status: UploadStatus.error,
                progress: 0
              }
            })
          },
          onProgress(bytesUploaded, bytesTotal): void {
            setUploadQueue({
              ...uploadQueue,
              [id]: {
                ...uploadQueue[id],
                progress: (bytesUploaded / bytesTotal) * 100
              }
            })
          }
        })

        upload.start()

        return id
      }
    }
    throw new Error('No file selected')
  }

  const value = {
    uploadCloudflareVideo,
    uploadQueue,
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

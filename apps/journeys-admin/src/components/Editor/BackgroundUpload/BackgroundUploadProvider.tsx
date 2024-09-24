import type { ReadStream } from 'fs'

import { gql, useLazyQuery, useMutation } from '@apollo/client'
import pick from 'lodash/pick'
import { ReactElement, ReactNode, useState } from 'react'
import { DefaultHttpStack, Upload } from 'tus-js-client'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../__generated__/BlockFields'
import {
  CoverVideoBlockCreate,
  CoverVideoBlockCreateVariables
} from '../../../../__generated__/CoverVideoBlockCreate'
import {
  CoverVideoBlockUpdate,
  CoverVideoBlockUpdateVariables
} from '../../../../__generated__/CoverVideoBlockUpdate'
import { CreateCloudflareVideoUploadByFileMutation } from '../../../../__generated__/CreateCloudflareVideoUploadByFileMutation'
import { GetMyCloudflareVideoQuery } from '../../../../__generated__/GetMyCloudflareVideoQuery'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../libs/useBlockRestoreMutation'
import { useCoverBlockDeleteMutation } from '../../../libs/useCoverBlockDeleteMutation'
import { useCoverBlockRestoreMutation } from '../../../libs/useCoverBlockRestoreMutation'

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

export const COVER_VIDEO_BLOCK_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation CoverVideoBlockCreate(
    $id: ID!
    $input: VideoBlockCreateInput!
    $cardBlockId: ID!
  ) {
    videoBlockCreate(input: $input) {
      ...VideoFields
    }
    cardBlockUpdate(id: $cardBlockId, input: { coverBlockId: $id }) {
      id
      coverBlockId
    }
  }
`

export const COVER_VIDEO_BLOCK_UPDATE = gql`
  ${VIDEO_FIELDS}
  mutation CoverVideoBlockUpdate($id: ID!, $input: VideoBlockUpdateInput!) {
    videoBlockUpdate(id: $id, input: $input) {
      ...VideoFields
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
  async function uploadCloudflareVideo({
    files,
    httpStack = new DefaultHttpStack({})
  }: uploadCloudflareVideoParams): Promise<string> {
    if (files.length > 0) {
      const file = files[0]
      const fileName = file.name.split('.')[0]
      const { data } = await createCloudflareVideoUploadByFile({
        variables: {
          uploadLength: file.size,
          name: fileName
        }
      })

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

  const { add } = useCommand()
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const [createBlock] = useMutation<
    CoverVideoBlockCreate,
    CoverVideoBlockCreateVariables
  >(COVER_VIDEO_BLOCK_CREATE)
  const [updateBlock] = useMutation<
    CoverVideoBlockUpdate,
    CoverVideoBlockUpdateVariables
  >(COVER_VIDEO_BLOCK_UPDATE)
  const [deleteBlock] = useCoverBlockDeleteMutation()
  const [restoreBlock] = useCoverBlockRestoreMutation()

  function createVideoBlock(
    input: VideoBlockUpdateInput,
    cardBlock: CardBlock
  ): void {
    if (journey == null || cardBlock == null) return

    const block: VideoBlock = {
      id: uuidv4(),
      __typename: 'VideoBlock',
      parentBlockId: cardBlock.id,
      parentOrder: null,
      title: null,
      description: null,
      image: null,
      video: null,
      action: null,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      muted: input.muted ?? null,
      autoplay: input.autoplay ?? null,
      duration: input.duration ?? null,
      videoId: input.videoId ?? null,
      videoVariantLanguageId: input.videoVariantLanguageId ?? null,
      source: input.source ?? VideoBlockSource.internal,
      posterBlockId: input.posterBlockId ?? null,
      fullsize: input.fullsize ?? null,
      objectFit: input.objectFit ?? null
    }

    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void createBlock({
          variables: {
            id: block.id,
            cardBlockId: cardBlock.id,
            input: {
              journeyId: journey.id,
              isCover: true,
              id: block.id,
              ...input,
              parentBlockId: cardBlock.id
            }
          },
          optimisticResponse: {
            videoBlockCreate: block,
            cardBlockUpdate: {
              __typename: 'CardBlock',
              id: cardBlock.id,
              coverBlockId: block.id
            }
          },
          update(cache, { data }) {
            if (data?.videoBlockCreate != null) {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs = []) {
                    const newBlockRef = cache.writeFragment({
                      data: data.videoBlockCreate,
                      fragment: gql`
                        fragment NewBlock on Block {
                          id
                        }
                      `
                    })
                    return [...existingBlockRefs, newBlockRef]
                  }
                }
              })
            }
          }
        })
      },
      undo() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void deleteBlock({
          variables: {
            id: block.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockDelete: [block],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: null,
              __typename: 'CardBlock'
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(block, data?.blockDelete, cache, journey.id)
          }
        })
      },
      redo() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void restoreBlock({
          variables: {
            id: block.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockRestore: [block],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: block.id,
              __typename: 'CardBlock'
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(block, data?.blockRestore, cache, journey.id)
          }
        })
      }
    })
  }

  function updateVideoBlock(
    input: VideoBlockUpdateInput,
    coverBlock: TreeBlock<ImageBlock> | TreeBlock<VideoBlock>
  ): void {
    if (
      journey == null ||
      coverBlock == null ||
      coverBlock.__typename === 'ImageBlock'
    )
      return

    const block: VideoBlock = {
      ...coverBlock,
      ...input,
      source: input.source ?? coverBlock.source
    }

    add({
      parameters: {
        execute: block,
        undo: coverBlock
      },
      execute(block) {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void updateBlock({
          variables: {
            id: coverBlock.id,
            input: pick(block, Object.keys(input))
          },
          optimisticResponse: {
            videoBlockUpdate: block
          }
        })
      }
    })
  }

  function deleteVideoBlock(
    cardBlock: CardBlock,
    coverBlock: TreeBlock<ImageBlock> | TreeBlock<VideoBlock>
  ): void {
    if (
      journey == null ||
      coverBlock == null ||
      coverBlock.__typename === 'ImageBlock' ||
      cardBlock == null
    )
      return

    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void deleteBlock({
          variables: {
            id: coverBlock.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockDelete: [coverBlock],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: null,
              __typename: 'CardBlock'
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(coverBlock, data?.blockDelete, cache, journey.id)
          }
        })
      },
      undo() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void restoreBlock({
          variables: {
            id: coverBlock.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockRestore: [coverBlock],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: coverBlock.id,
              __typename: 'CardBlock'
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(
              coverBlock,
              data?.blockRestore,
              cache,
              journey.id
            )
          }
        })
      }
    })
  }

  async function handleChange(input: VideoBlockUpdateInput): Promise<void> {
    if (input.videoId === null) {
      await deleteVideoBlock()
    } else if (coverBlock == null) {
      await createVideoBlock(input)
    } else {
      await updateVideoBlock(input)
    }
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

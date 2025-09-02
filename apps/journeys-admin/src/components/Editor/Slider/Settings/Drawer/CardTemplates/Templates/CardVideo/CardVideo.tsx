import { Reference, gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import Image from 'next/image'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import type {
  CardVideoCreate,
  CardVideoCreateVariables
} from '../../../../../../../../../__generated__/CardVideoCreate'
import {
  CardVideoDelete,
  CardVideoDeleteVariables
} from '../../../../../../../../../__generated__/CardVideoDelete'
import {
  CardVideoRestore,
  CardVideoRestoreVariables
} from '../../../../../../../../../__generated__/CardVideoRestore'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import cardVideoImage from './cardVideo.svg'

export const CARD_VIDEO_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation CardVideoCreate($videoInput: VideoBlockCreateInput!) {
    video: videoBlockCreate(input: $videoInput) {
      ...VideoFields
    }
  }
`

export const CARD_VIDEO_DELETE = gql`
  ${VIDEO_FIELDS}
  mutation CardVideoDelete($videoId: ID!) {
    video: blockDelete(id: $videoId) {
      ...VideoFields
    }
  }
`

export const CARD_VIDEO_RESTORE = gql`
  ${VIDEO_FIELDS}
  mutation CardVideoRestore($videoId: ID!) {
    video: blockRestore(id: $videoId) {
      ...VideoFields
    }
  }
`

export function CardVideo(): ReactElement {
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const [cardVideoCreate] = useMutation<
    CardVideoCreate,
    CardVideoCreateVariables
  >(CARD_VIDEO_CREATE)

  const [cardVideoDelete] = useMutation<
    CardVideoDelete,
    CardVideoDeleteVariables
  >(CARD_VIDEO_DELETE)

  const [cardVideoRestore] = useMutation<
    CardVideoRestore,
    CardVideoRestoreVariables
  >(CARD_VIDEO_RESTORE)

  function handleClick(): void {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return

    const videoBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      muted: false,
      autoplay: true,
      startAt: 2048,
      endAt: 2058,
      posterBlockId: null,
      fullsize: null,
      videoId: '1_jf-0-0',
      videoVariantLanguageId: '529',
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      image: null,
      duration: null,
      objectFit: null,
      mediaVideo: {
        id: '1_jf-0-0',
        title: [
          {
            value: 'JESUS',
            __typename: 'VideoTitle'
          }
        ],
        images: [
          {
            __typename: 'CloudflareImage',
            mobileCinematicHigh:
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
          }
        ],
        variant: {
          id: '1_529-jf-0-0',
          hls: 'https://arc.gt/j67rz',
          __typename: 'VideoVariant'
        },
        variantLanguages: [],
        __typename: 'Video'
      },
      action: null,
      __typename: 'VideoBlock'
    } satisfies VideoBlock

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        void cardVideoCreate({
          variables: {
            videoInput: {
              id: videoBlock.id,
              journeyId: journey.id,
              parentBlockId: videoBlock.parentBlockId,
              videoId: videoBlock.videoId,
              videoVariantLanguageId: videoBlock.videoVariantLanguageId,
              startAt: videoBlock.startAt,
              endAt: videoBlock.endAt,
              autoplay: videoBlock.autoplay,
              muted: videoBlock.muted,
              source: videoBlock.source
            }
          },
          optimisticResponse: {
            video: videoBlock
          },
          update(cache, { data }) {
            if (data != null) {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs = []) {
                    const NEW_BLOCK_FRAGMENT = gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                    return [
                      ...existingBlockRefs,
                      cache.writeFragment({
                        data: data.video,
                        fragment: NEW_BLOCK_FRAGMENT
                      })
                    ]
                  }
                }
              })
            }
          }
        })
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId: videoBlock.id
        })
      },
      undo() {
        void cardVideoDelete({
          variables: {
            videoId: videoBlock.id
          },
          optimisticResponse: {
            video: []
          },
          update(cache, { data }) {
            if (data == null) return
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs: Reference[], { readField }) {
                  return existingBlockRefs?.filter(
                    (ref) => readField('id', ref) !== videoBlock.id
                  )
                }
              }
            })
            cache.evict({
              id: cache.identify({
                __typename: videoBlock.__typename,
                id: videoBlock.id
              })
            })
            cache.gc()
          }
        })
      },
      redo() {
        void cardVideoRestore({
          variables: {
            videoId: videoBlock.id
          },
          optimisticResponse: {
            video: [videoBlock]
          },
          update(cache, { data }) {
            if (data == null) return
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs: Reference[], { readField }) {
                  const NEW_BLOCK_FRAGMENT = gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                  if (
                    existingBlockRefs?.some(
                      (ref) => readField('id', ref) === videoBlock.id
                    )
                  ) {
                    return existingBlockRefs
                  }
                  return [
                    ...existingBlockRefs,
                    cache.writeFragment({
                      data: videoBlock,
                      fragment: NEW_BLOCK_FRAGMENT
                    })
                  ]
                }
              }
            })
          }
        })
      }
    })
  }

  return (
    <ButtonBase sx={{ borderRadius: 5 }} onClick={handleClick}>
      <Image
        width={128}
        height={192}
        layout="responsive"
        src={cardVideoImage}
        alt="Card Video Template"
        draggable={false}
      />
    </ButtonBase>
  )
}

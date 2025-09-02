import { Reference, gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_IconBlock as IconBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  CardIntroCreate,
  CardIntroCreateVariables
} from '../../../../../../../../../__generated__/CardIntroCreate'
import {
  CardIntroDelete,
  CardIntroDeleteVariables
} from '../../../../../../../../../__generated__/CardIntroDelete'
import {
  CardIntroRestore,
  CardIntroRestoreVariables
} from '../../../../../../../../../__generated__/CardIntroRestore'
import {
  ButtonVariant,
  IconName,
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import cardIntroImage from './cardIntro.svg'

export const CARD_INTRO_CREATE = gql`
  ${TYPOGRAPHY_FIELDS}
  ${BUTTON_FIELDS}
  ${VIDEO_FIELDS}
  ${ICON_FIELDS}
  mutation CardIntroCreate(
    $journeyId: ID!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $bodyInput: TypographyBlockCreateInput!
    $buttonInput: ButtonBlockCreateInput!
    $buttonId: ID!
    $buttonUpdateInput: ButtonBlockUpdateInput!
    $startIconInput: IconBlockCreateInput!
    $endIconInput: IconBlockCreateInput!
    $videoInput: VideoBlockCreateInput!
  ) {
    subtitle: typographyBlockCreate(input: $subtitleInput) {
      ...TypographyFields
    }
    title: typographyBlockCreate(input: $titleInput) {
      ...TypographyFields
    }
    body: typographyBlockCreate(input: $bodyInput) {
      ...TypographyFields
    }
    button: buttonBlockCreate(input: $buttonInput) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $startIconInput) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $endIconInput) {
      ...IconFields
    }
    buttonBlockUpdate(
      id: $buttonId
      journeyId: $journeyId
      input: $buttonUpdateInput
    ) {
      ...ButtonFields
    }
    video: videoBlockCreate(input: $videoInput) {
      ...VideoFields
    }
  }
`

export const CARD_INTRO_DELETE = gql`
  mutation CardIntroDelete(
    $subtitleId: ID!
    $titleId: ID!
    $bodyId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
    $videoId: ID!
  ) {
    video: blockDelete(id: $videoId) {
      id
      parentOrder
    }
    endIcon: blockDelete(id: $endIconId) {
      id
      parentOrder
    }
    startIcon: blockDelete(id: $startIconId) {
      id
      parentOrder
    }
    button: blockDelete(id: $buttonId) {
      id
      parentOrder
    }
    body: blockDelete(id: $bodyId) {
      id
      parentOrder
    }
    title: blockDelete(id: $titleId) {
      id
      parentOrder
    }
    subtitle: blockDelete(id: $subtitleId) {
      id
      parentOrder
    }
  }
`

export const CARD_INTRO_RESTORE = gql`
  ${BLOCK_FIELDS}
  mutation CardIntroRestore(
    $subtitleId: ID!
    $titleId: ID!
    $bodyId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
    $videoId: ID!
  ) {
    subtitle: blockRestore(id: $subtitleId) {
      ...BlockFields
    }
    title: blockRestore(id: $titleId) {
      ...BlockFields
    }
    body: blockRestore(id: $bodyId) {
      ...BlockFields
    }
    button: blockRestore(id: $buttonId) {
      ...BlockFields
    }
    startIcon: blockRestore(id: $startIconId) {
      ...BlockFields
    }
    endIcon: blockRestore(id: $endIconId) {
      ...BlockFields
    }
    video: blockRestore(id: $videoId) {
      ...BlockFields
    }
  }
`

export function CardIntro(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { add } = useCommand()

  const [cardIntroCreate] = useMutation<
    CardIntroCreate,
    CardIntroCreateVariables
  >(CARD_INTRO_CREATE)

  const [cardIntroDelete] = useMutation<
    CardIntroDelete,
    CardIntroDeleteVariables
  >(CARD_INTRO_DELETE)

  const [cardIntroRestore] = useMutation<
    CardIntroRestore,
    CardIntroRestoreVariables
  >(CARD_INTRO_RESTORE)

  function handleClick(): void {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null || selectedStep == null) return

    const subtitle = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      align: null,
      color: null,
      content: t('Interactive Video'),
      variant: TypographyVariant.h6,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const title = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 1,
      align: null,
      color: null,
      content: t("Jesus: History's Most Influential Figure?"),
      variant: TypographyVariant.h1,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const body = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 2,
      align: null,
      color: null,
      content: t(
        'Journey through time, from dusty roads to modern cities, to understand the lasting impact and relevance of Jesus.'
      ),
      variant: TypographyVariant.body1,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const buttonBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 3,
      label: t('Begin the Journey'),
      buttonVariant: ButtonVariant.contained,
      buttonColor: null,
      size: null,
      startIconId: null,
      endIconId: null,
      submitEnabled: null,
      action: null,
      settings: null,
      __typename: 'ButtonBlock'
    } satisfies ButtonBlock

    const startIconBlock = {
      id: uuidv4(),
      parentBlockId: buttonBlock.id,
      parentOrder: null,
      iconName: null,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const endIconBlock = {
      id: uuidv4(),
      parentBlockId: buttonBlock.id,
      parentOrder: null,
      iconName: IconName.ArrowForwardRounded,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const buttonBlockUpdate = {
      ...buttonBlock,
      startIconId: startIconBlock.id,
      endIconId: endIconBlock.id,
      submitEnabled: null
    } satisfies ButtonBlock

    const videoBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: null,
      muted: null,
      autoplay: null,
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
        __typename: 'Video',
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
        variantLanguages: []
      },
      action: null,
      __typename: 'VideoBlock'
    } satisfies VideoBlock

    const createdBlocks = [
      subtitle,
      title,
      body,
      buttonBlockUpdate,
      startIconBlock,
      endIconBlock,
      videoBlock
    ]

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        void cardIntroCreate({
          variables: {
            journeyId: journey.id,
            buttonId: buttonBlock.id,
            subtitleInput: {
              ...omit(
                {
                  ...subtitle,
                  settings: { color: subtitle.settings?.color }
                },
                ['__typename', 'parentOrder']
              ),
              journeyId: journey.id
            },
            titleInput: {
              ...omit(
                {
                  ...title,
                  settings: { color: title.settings?.color }
                },
                ['__typename', 'parentOrder']
              ),
              journeyId: journey.id
            },
            bodyInput: {
              ...omit(
                {
                  ...body,
                  settings: { color: body.settings?.color }
                },
                ['__typename', 'parentOrder']
              ),
              journeyId: journey.id
            },
            buttonInput: {
              ...pick(buttonBlock, ['id', 'parentBlockId', 'label', 'size']),
              journeyId: journey.id,
              variant: buttonBlock.buttonVariant
            },
            startIconInput: {
              ...pick(startIconBlock, ['id', 'parentBlockId']),
              journeyId: journey.id
            },
            endIconInput: {
              ...pick(endIconBlock, ['id', 'parentBlockId']),
              journeyId: journey.id,
              name: endIconBlock.iconName
            },
            buttonUpdateInput: {
              startIconId: buttonBlockUpdate.startIconId,
              endIconId: buttonBlockUpdate.endIconId
            },
            videoInput: {
              ...pick(videoBlock, [
                'id',
                'parentBlockId',
                'videoVariantLanguageId',
                'startAt',
                'endAt',
                'source'
              ]),
              videoId: videoBlock.mediaVideo?.id,
              journeyId: journey.id,
              isCover: true
            }
          },
          optimisticResponse: {
            subtitle,
            title,
            body,
            button: buttonBlock,
            startIcon: startIconBlock,
            endIcon: endIconBlock,
            buttonBlockUpdate,
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
                    const keys = Object.keys(data).filter(
                      (key) => key !== 'buttonBlockUpdate'
                    )
                    return [
                      ...existingBlockRefs,
                      ...keys.map((key) =>
                        cache.writeFragment({
                          data: data[key],
                          fragment: NEW_BLOCK_FRAGMENT
                        })
                      )
                    ]
                  }
                }
              })
              cache.modify({
                id: cache.identify({
                  __typename: 'CardBlock',
                  id: cardId
                }),
                fields: {
                  coverBlockId: () => data.video.id
                }
              })
            }
          }
        })
      },
      undo() {
        void cardIntroDelete({
          variables: {
            subtitleId: subtitle.id,
            titleId: title.id,
            bodyId: body.id,
            buttonId: buttonBlock.id,
            startIconId: startIconBlock.id,
            endIconId: endIconBlock.id,
            videoId: videoBlock.id
          },
          optimisticResponse: {
            subtitle: [subtitle],
            title: [title],
            body: [body],
            button: [buttonBlockUpdate],
            startIcon: [startIconBlock],
            endIcon: [endIconBlock],
            video: [videoBlock]
          },
          update(cache, { data }) {
            if (data == null) return
            createdBlocks.forEach((block) => {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs: Reference[], { readField }) {
                    return existingBlockRefs.filter(
                      (ref) => readField('id', ref) !== block.id
                    )
                  }
                }
              })
              cache.evict({
                id: cache.identify({
                  __typename: block.__typename,
                  id: block.id
                })
              })
              cache.gc()
            })
          }
        })
      },
      redo() {
        void cardIntroRestore({
          variables: {
            subtitleId: subtitle.id,
            titleId: title.id,
            bodyId: body.id,
            buttonId: buttonBlock.id,
            startIconId: startIconBlock.id,
            endIconId: endIconBlock.id,
            videoId: videoBlock.id
          },
          optimisticResponse: {
            subtitle: [subtitle],
            title: [title],
            body: [body],
            button: [buttonBlockUpdate],
            startIcon: [startIconBlock],
            endIcon: [endIconBlock],
            video: [videoBlock]
          },
          update(cache, { data }) {
            if (data == null) return
            const keys = Object.keys(data)
            keys.forEach((key) => {
              data[key].forEach((block) => {
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
                        existingBlockRefs.some(
                          (ref) => readField('id', ref) === block.id
                        )
                      ) {
                        return existingBlockRefs
                      }
                      return [
                        ...existingBlockRefs,
                        cache.writeFragment({
                          data: block,
                          fragment: NEW_BLOCK_FRAGMENT
                        })
                      ]
                    }
                  }
                })
              })
            })
            cache.modify({
              id: cache.identify({
                __typename: 'CardBlock',
                id: cardId
              }),
              fields: {
                coverBlockId: () => videoBlock.id
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
        height={195}
        layout="responsive"
        src={cardIntroImage}
        alt="Card Intro Template"
        draggable={false}
      />
    </ButtonBase>
  )
}

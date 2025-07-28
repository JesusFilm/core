import { Reference, gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import omit from 'lodash/omit'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RADIO_OPTION_FIELDS } from '@core/journeys/ui/RadioOption/radioOptionFields'
import { RADIO_QUESTION_FIELDS } from '@core/journeys/ui/RadioQuestion/radioQuestionFields'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import type {
  CardPollCreate,
  CardPollCreateVariables
} from '../../../../../../../../../__generated__/CardPollCreate'
import {
  CardPollDelete,
  CardPollDeleteVariables
} from '../../../../../../../../../__generated__/CardPollDelete'
import {
  CardPollRestore,
  CardPollRestoreVariables
} from '../../../../../../../../../__generated__/CardPollRestore'
import {
  ThemeMode,
  ThemeName,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import cardPollImage from './cardPoll.svg'

export const CARD_POLL_CREATE = gql`
  ${IMAGE_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${RADIO_QUESTION_FIELDS}
  ${RADIO_OPTION_FIELDS}
  ${CARD_FIELDS}
  mutation CardPollCreate(
    $imageInput: ImageBlockCreateInput!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $radioQuestionInput: RadioQuestionBlockCreateInput!
    $radioOptionInput1: RadioOptionBlockCreateInput!
    $radioOptionInput2: RadioOptionBlockCreateInput!
    $radioOptionInput3: RadioOptionBlockCreateInput!
    $radioOptionInput4: RadioOptionBlockCreateInput!
    $bodyInput: TypographyBlockCreateInput!
    $journeyId: ID!
    $cardId: ID!
    $cardInput: CardBlockUpdateInput!
  ) {
    image: imageBlockCreate(input: $imageInput) {
      ...ImageFields
    }
    subtitle: typographyBlockCreate(input: $subtitleInput) {
      ...TypographyFields
    }
    title: typographyBlockCreate(input: $titleInput) {
      ...TypographyFields
    }
    radioQuestion: radioQuestionBlockCreate(input: $radioQuestionInput) {
      ...RadioQuestionFields
    }
    radioOption1: radioOptionBlockCreate(input: $radioOptionInput1) {
      ...RadioOptionFields
    }
    radioOption2: radioOptionBlockCreate(input: $radioOptionInput2) {
      ...RadioOptionFields
    }
    radioOption3: radioOptionBlockCreate(input: $radioOptionInput3) {
      ...RadioOptionFields
    }
    radioOption4: radioOptionBlockCreate(input: $radioOptionInput4) {
      ...RadioOptionFields
    }
    body: typographyBlockCreate(input: $bodyInput) {
      ...TypographyFields
    }
    cardBlockUpdate(id: $cardId, journeyId: $journeyId, input: $cardInput) {
      ...CardFields
    }
  }
`
// the delete needs to done in the reverse order of the create - this is needed to preserve the accurate block order
export const CARD_POLL_DELETE = gql`
  mutation CardPollDelete(
    $imageId: ID!
    $subtitleId: ID!
    $titleId: ID!
    $radioQuestionId: ID!
    $radioOption1Id: ID!
    $radioOption2Id: ID!
    $radioOption3Id: ID!
    $radioOption4Id: ID!
    $bodyId: ID!
  ) {
    bodyDelete: blockDelete(id: $bodyId) {
      id
      parentOrder
    }
    radioOption4Delete: blockDelete(id: $radioOption4Id) {
      id
      parentOrder
    }
    radioOption3Delete: blockDelete(id: $radioOption3Id) {
      id
      parentOrder
    }
    radioOption2Delete: blockDelete(id: $radioOption2Id) {
      id
      parentOrder
    }
    radioOption1Delete: blockDelete(id: $radioOption1Id) {
      id
      parentOrder
    }
    radioQuestionDelete: blockDelete(id: $radioQuestionId) {
      id
      parentOrder
    }
    titleDelete: blockDelete(id: $titleId) {
      id
      parentOrder
    }
    subtitleDelete: blockDelete(id: $subtitleId) {
      id
      parentOrder
    }
    imageDelete: blockDelete(id: $imageId) {
      id
      parentOrder
    }
  }
`

export const CARD_POLL_RESTORE = gql`
  ${BLOCK_FIELDS}
  mutation CardPollRestore(
    $imageId: ID!
    $subtitleId: ID!
    $titleId: ID!
    $radioQuestionId: ID!
    $radioOption1Id: ID!
    $radioOption2Id: ID!
    $radioOption3Id: ID!
    $radioOption4Id: ID!
    $bodyId: ID!
  ) {
    imageRestore: blockRestore(id: $imageId) {
      ...BlockFields
    }
    subtitleRestore: blockRestore(id: $subtitleId) {
      ...BlockFields
    }
    titleRestore: blockRestore(id: $titleId) {
      ...BlockFields
    }
    radioQuestionRestore: blockRestore(id: $radioQuestionId) {
      ...BlockFields
    }
    radioOption1Restore: blockRestore(id: $radioOption1Id) {
      ...BlockFields
    }
    radioOption2Restore: blockRestore(id: $radioOption2Id) {
      ...BlockFields
    }
    radioOption3Restore: blockRestore(id: $radioOption3Id) {
      ...BlockFields
    }
    radioOption4Restore: blockRestore(id: $radioOption4Id) {
      ...BlockFields
    }
    bodyRestore: blockRestore(id: $bodyId) {
      ...BlockFields
    }
  }
`

export function CardPoll(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { add } = useCommand()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardPollCreate] = useMutation<CardPollCreate, CardPollCreateVariables>(
    CARD_POLL_CREATE
  )
  const [cardPollDelete] = useMutation<CardPollDelete, CardPollDeleteVariables>(
    CARD_POLL_DELETE
  )
  const [cardPollRestore] = useMutation<
    CardPollRestore,
    CardPollRestoreVariables
  >(CARD_POLL_RESTORE)

  function handleClick(): void {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null || selectedStep == null) return
    const imageBlock = {
      __typename: 'ImageBlock',
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: null,
      alt: 'photo-1488048924544-c818a467dacd',
      blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
      height: 3456,
      src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
      width: 5184,
      scale: null,
      focalLeft: 50,
      focalTop: 50
    } satisfies ImageBlock

    const subtitle = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      align: null,
      color: null,
      content: t('Got an Opinion?'),
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
      content: t("Which of Jesus' teachings challenges you the most?"),
      variant: TypographyVariant.h2,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const radioQuestionBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 2,
      gridView: false,
      __typename: 'RadioQuestionBlock'
    } satisfies RadioQuestionBlock

    const radioOptionBlock1 = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 0,
      label: t('Turning the other cheek'),
      action: null,
      pollOptionImageId: null,
      __typename: 'RadioOptionBlock'
    } satisfies RadioOptionBlock

    const radioOptionBlock2 = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 1,
      label: t('Loving your enemies'),
      action: null,
      pollOptionImageId: null,
      __typename: 'RadioOptionBlock'
    } satisfies RadioOptionBlock

    const radioOptionBlock3 = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 2,
      label: t('Not worrying about tomorrow'),
      action: null,
      pollOptionImageId: null,
      __typename: 'RadioOptionBlock'
    } satisfies RadioOptionBlock

    const radioOptionBlock4 = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 3,
      label: t('Seeking first the kingdom of God'),
      action: null,
      pollOptionImageId: null,
      __typename: 'RadioOptionBlock'
    } satisfies RadioOptionBlock

    const body = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 3,
      align: null,
      color: TypographyColor.secondary,
      content: t('↑ Select an answer to continue'),
      variant: TypographyVariant.caption,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const cardBlock = {
      id: cardId,
      parentBlockId: selectedStep.id,
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: imageBlock.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      backdropBlur: null,
      __typename: 'CardBlock'
    } satisfies CardBlock

    const createdBlocks = [
      imageBlock,
      subtitle,
      title,
      radioQuestionBlock,
      radioOptionBlock1,
      radioOptionBlock2,
      radioOptionBlock3,
      radioOptionBlock4,
      body
    ]

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        void cardPollCreate({
          variables: {
            imageInput: {
              ...omit(imageBlock, ['__typename', 'parentOrder']),
              journeyId: journey.id,
              isCover: true
            },
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
            radioQuestionInput: {
              ...omit(radioQuestionBlock, ['__typename', 'parentOrder']),
              journeyId: journey.id
            },
            radioOptionInput1: {
              ...omit(radioOptionBlock1, [
                '__typename',
                'parentOrder',
                'action'
              ]),
              journeyId: journey.id
            },
            radioOptionInput2: {
              ...omit(radioOptionBlock2, [
                '__typename',
                'parentOrder',
                'action'
              ]),
              journeyId: journey.id
            },
            radioOptionInput3: {
              ...omit(radioOptionBlock3, [
                '__typename',
                'parentOrder',
                'action'
              ]),
              journeyId: journey.id
            },
            radioOptionInput4: {
              ...omit(radioOptionBlock4, [
                '__typename',
                'parentOrder',
                'action'
              ]),
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
            journeyId: journey.id,
            cardId: cardBlock.id,
            cardInput: { fullscreen: cardBlock.fullscreen }
          },
          optimisticResponse: {
            image: imageBlock,
            subtitle,
            title,
            radioQuestion: radioQuestionBlock,
            radioOption1: radioOptionBlock1,
            radioOption2: radioOptionBlock2,
            radioOption3: radioOptionBlock3,
            radioOption4: radioOptionBlock4,
            body,
            cardBlockUpdate: cardBlock
          },
          update(cache, { data }) {
            if (data == null) return
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
                    (key) => key !== 'cardBlockUpdate'
                  )
                  return [
                    ...existingBlockRefs,
                    ...keys.map((key) => {
                      return cache.writeFragment({
                        data: data[key],
                        fragment: NEW_BLOCK_FRAGMENT
                      })
                    })
                  ]
                }
              }
            })
          }
        })
      },
      undo() {
        void cardPollDelete({
          variables: {
            imageId: imageBlock.id,
            subtitleId: subtitle.id,
            titleId: title.id,
            radioQuestionId: radioQuestionBlock.id,
            radioOption1Id: radioOptionBlock1.id,
            radioOption2Id: radioOptionBlock2.id,
            radioOption3Id: radioOptionBlock3.id,
            radioOption4Id: radioOptionBlock4.id,
            bodyId: body.id
          },
          optimisticResponse: {
            imageDelete: [],
            subtitleDelete: [],
            titleDelete: [],
            radioQuestionDelete: [],
            radioOption1Delete: [],
            radioOption2Delete: [],
            radioOption3Delete: [],
            radioOption4Delete: [],
            bodyDelete: []
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
        void cardPollRestore({
          variables: {
            imageId: imageBlock.id,
            subtitleId: subtitle.id,
            titleId: title.id,
            radioQuestionId: radioQuestionBlock.id,
            radioOption1Id: radioOptionBlock1.id,
            radioOption2Id: radioOptionBlock2.id,
            radioOption3Id: radioOptionBlock3.id,
            radioOption4Id: radioOptionBlock4.id,
            bodyId: body.id
          },
          optimisticResponse: {
            imageRestore: [imageBlock],
            subtitleRestore: [subtitle],
            titleRestore: [title],
            radioQuestionRestore: [radioQuestionBlock],
            radioOption1Restore: [radioOptionBlock1],
            radioOption2Restore: [radioOptionBlock2],
            radioOption3Restore: [radioOptionBlock3],
            radioOption4Restore: [radioOptionBlock4],
            bodyRestore: [body]
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
        src={cardPollImage}
        alt="Card Poll Template"
        draggable={false}
      />
    </ButtonBase>
  )
}

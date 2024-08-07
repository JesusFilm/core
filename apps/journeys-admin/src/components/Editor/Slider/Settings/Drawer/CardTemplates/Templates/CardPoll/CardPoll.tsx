import { gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import noop from 'lodash/noop'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

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

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null || selectedStep == null) return
    const imageBlock: ImageBlock = {
      __typename: 'ImageBlock',
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: null,
      alt: 'photo-1488048924544-c818a467dacd',
      blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
      height: 3456,
      src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
      width: 5184
    }
    const subtitle: TypographyBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      align: null,
      color: null,
      content: t('Got an Opinion?'),
      variant: TypographyVariant.h6,
      __typename: 'TypographyBlock'
    }
    const title: TypographyBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 1,
      align: null,
      color: null,
      content: t("Which of Jesus' teachings challenges you the most?"),
      variant: TypographyVariant.h2,
      __typename: 'TypographyBlock'
    }

    const radioQuestionBlock: RadioQuestionBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 2,
      __typename: 'RadioQuestionBlock'
    }

    const radioOptionBlock1: RadioOptionBlock = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 0,
      label: t('Turning the other cheek'),
      action: null,
      __typename: 'RadioOptionBlock'
    }

    const radioOptionBlock2: RadioOptionBlock = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 1,
      label: t('Loving your enemies'),
      action: null,
      __typename: 'RadioOptionBlock'
    }

    const radioOptionBlock3: RadioOptionBlock = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 2,
      label: t('Not worrying about tomorrow'),
      action: null,
      __typename: 'RadioOptionBlock'
    }

    const radioOptionBlock4: RadioOptionBlock = {
      id: uuidv4(),
      parentBlockId: radioQuestionBlock.id,
      parentOrder: 3,
      label: t('Seeking first the kingdom of God'),
      action: null,
      __typename: 'RadioOptionBlock'
    }

    const body: TypographyBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 3,
      align: null,
      color: TypographyColor.secondary,
      content: t('↑ Select an answer to continue'),
      variant: TypographyVariant.caption,
      __typename: 'TypographyBlock'
    }

    const cardBlock: CardBlock = {
      id: cardId,
      parentBlockId: selectedStep.id,
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: imageBlock.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: true,
      __typename: 'CardBlock'
    }

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        void cardPollCreate({
          variables: {
            imageInput: {
              id: imageBlock.id,
              journeyId: journey.id,
              parentBlockId: imageBlock.parentBlockId,
              alt: imageBlock.alt,
              blurhash: imageBlock.blurhash,
              height: imageBlock.height,
              src: imageBlock.src,
              width: imageBlock.width,
              isCover: true
            },
            subtitleInput: {
              id: subtitle.id,
              journeyId: journey.id,
              parentBlockId: subtitle.parentBlockId as string,
              content: subtitle.content,
              variant: subtitle.variant
            },
            titleInput: {
              id: title.id,
              journeyId: journey.id,
              parentBlockId: title.parentBlockId as string,
              content: title.content,
              variant: title.variant
            },
            radioQuestionInput: {
              id: radioQuestionBlock.id,
              journeyId: journey.id,
              parentBlockId: radioQuestionBlock.parentBlockId as string
            },
            radioOptionInput1: {
              id: radioOptionBlock1.id,
              journeyId: journey.id,
              parentBlockId: radioOptionBlock1.parentBlockId as string,
              label: radioOptionBlock1.label
            },
            radioOptionInput2: {
              id: radioOptionBlock2.id,
              journeyId: journey.id,
              parentBlockId: radioOptionBlock2.parentBlockId as string,
              label: radioOptionBlock2.label
            },
            radioOptionInput3: {
              id: radioOptionBlock3.id,
              journeyId: journey.id,
              parentBlockId: radioOptionBlock3.parentBlockId as string,
              label: radioOptionBlock3.label
            },
            radioOptionInput4: {
              id: radioOptionBlock4.id,
              journeyId: journey.id,
              parentBlockId: radioOptionBlock4.parentBlockId as string,
              label: radioOptionBlock4.label
            },
            bodyInput: {
              id: body.id,
              journeyId: journey.id,
              parentBlockId: body.parentBlockId as string,
              content: body.content,
              variant: body.variant,
              color: body.color
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
                        data: data.image,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.subtitle,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.title,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.radioQuestion,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.radioOption1,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.radioOption2,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.radioOption3,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.radioOption4,
                        fragment: NEW_BLOCK_FRAGMENT
                      }),
                      cache.writeFragment({
                        data: data.body,
                        fragment: NEW_BLOCK_FRAGMENT
                      })
                    ]
                  }
                }
              })
            }
          }
        })
      },
      undo() {
        noop()
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
        style={{ backgroundColor: 'red' }}
      />
    </ButtonBase>
  )
}

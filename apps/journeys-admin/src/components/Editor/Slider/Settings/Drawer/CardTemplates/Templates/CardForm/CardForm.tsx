import { Reference, gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import omit from 'lodash/omit'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import type {
  CardFormCreate,
  CardFormCreateVariables
} from '../../../../../../../../../__generated__/CardFormCreate'
import {
  CardFormDelete,
  CardFormDeleteVariables
} from '../../../../../../../../../__generated__/CardFormDelete'
import {
  CardFormRestore,
  CardFormRestoreVariables
} from '../../../../../../../../../__generated__/CardFormRestore'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  ThemeMode,
  ThemeName,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import cardFormImage from './cardForm.svg'

/**
 * GraphQL mutation for creating a card form template with multiple blocks.
 * Creates an image, subtitle, title, text response, and body blocks within a card.
 */
export const CARD_FORM_CREATE = gql`
  ${IMAGE_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${TEXT_RESPONSE_FIELDS}
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  ${CARD_FIELDS}
  mutation CardFormCreate(
    $imageInput: ImageBlockCreateInput!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $textResponseInput: TextResponseBlockCreateInput!
    $buttonInput: ButtonBlockCreateInput!
    $buttonId: ID!
    $buttonUpdateInput: ButtonBlockUpdateInput!
    $startIconInput: IconBlockCreateInput!
    $endIconInput: IconBlockCreateInput!
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
    textResponse: textResponseBlockCreate(input: $textResponseInput) {
      ...TextResponseFields
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
    buttonUpdate: buttonBlockUpdate(
      id: $buttonId
      journeyId: $journeyId
      input: $buttonUpdateInput
    ) {
      ...ButtonFields
    }
    body: typographyBlockCreate(input: $bodyInput) {
      ...TypographyFields
    }
    cardBlockUpdate(id: $cardId, journeyId: $journeyId, input: $cardInput) {
      ...CardFields
    }
  }
`

/**
 * GraphQL mutation for deleting all blocks in a card form template.
 */
export const CARD_FORM_DELETE = gql`
  ${CARD_FIELDS}
  mutation CardFormDelete(
    $imageId: ID!
    $subtitleId: ID!
    $titleId: ID!
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
    $bodyId: ID!
    $cardId: ID!
    $journeyId: ID!
    $cardInput: CardBlockUpdateInput!
  ) {
    body: blockDelete(id: $bodyId) {
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
    textResponse: blockDelete(id: $textResponseId) {
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
    image: blockDelete(id: $imageId) {
      id
      parentOrder
    }
    cardBlockUpdate(id: $cardId, journeyId: $journeyId, input: $cardInput) {
      ...CardFields
    }
  }
`

/**
 * GraphQL mutation for restoring all blocks in a card form template.
 */
export const CARD_FORM_RESTORE = gql`
  ${BLOCK_FIELDS}
  mutation CardFormRestore(
    $imageId: ID!
    $subtitleId: ID!
    $titleId: ID!
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
    $bodyId: ID!
    $cardId: ID!
    $journeyId: ID!
    $cardInput: CardBlockUpdateInput!
  ) {
    image: blockRestore(id: $imageId) {
      ...BlockFields
    }
    subtitle: blockRestore(id: $subtitleId) {
      ...BlockFields
    }
    title: blockRestore(id: $titleId) {
      ...BlockFields
    }
    textResponse: blockRestore(id: $textResponseId) {
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
    body: blockRestore(id: $bodyId) {
      ...BlockFields
    }
    cardBlockUpdate(id: $cardId, journeyId: $journeyId, input: $cardInput) {
      ...CardFields
    }
  }
`

/**
 * A component that renders a button with a card form template image.
 * When clicked, creates a predefined form card layout with text response input.
 *
 * @returns {ReactElement} The CardForm component.
 */
export function CardForm(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const { add } = useCommand()

  const [cardFormCreate] = useMutation<CardFormCreate, CardFormCreateVariables>(
    CARD_FORM_CREATE
  )

  const [cardFormDelete] = useMutation<CardFormDelete, CardFormDeleteVariables>(
    CARD_FORM_DELETE
  )

  const [cardFormRestore] = useMutation<
    CardFormRestore,
    CardFormRestoreVariables
  >(CARD_FORM_RESTORE)

  function handleClick(): void {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null || selectedStep == null) return

    const imageBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
      alt: 'photo-1488048924544-c818a467dacd',
      width: 5184,
      height: 3456,
      blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
      __typename: 'ImageBlock',
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
      content: t('Prayer Request'),
      variant: TypographyVariant.h6,
      __typename: 'TypographyBlock'
    } satisfies TypographyBlock

    const title = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 1,
      align: null,
      color: null,
      content: t('How can we pray for you?'),
      variant: TypographyVariant.h1,
      __typename: 'TypographyBlock'
    } satisfies TypographyBlock

    const textResponseBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 2,
      label: t('My Prayer:'),
      placeholder: null,
      hint: null,
      minRows: null,
      type: null,
      routeId: null,
      integrationId: null,
      required: null,
      __typename: 'TextResponseBlock'
    } satisfies TextResponseBlock

    const buttonBlock = {
      id: uuidv4(),
      __typename: 'ButtonBlock',
      parentBlockId: cardId,
      parentOrder: 3,
      label: '',
      buttonVariant: ButtonVariant.contained,
      buttonColor: ButtonColor.primary,
      size: ButtonSize.medium,
      startIconId: uuidv4(),
      endIconId: uuidv4(),
      action: null,
      submitEnabled: true
    } satisfies ButtonBlock

    const body = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 4,
      align: null,
      color: TypographyColor.secondary,
      content: t(
        "Each day, we pray for those in our city. We'd be grateful to include your personal needs."
      ),
      variant: TypographyVariant.caption,
      __typename: 'TypographyBlock'
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
      textResponseBlock,
      buttonBlock,
      body
    ]

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        void cardFormCreate({
          variables: {
            imageInput: {
              ...omit(imageBlock, ['__typename', 'parentOrder']),
              journeyId: journey.id,
              isCover: true
            },
            subtitleInput: {
              ...omit(subtitle, ['__typename', 'parentOrder']),
              journeyId: journey.id
            },
            titleInput: {
              ...omit(title, ['__typename', 'parentOrder']),
              journeyId: journey.id
            },
            textResponseInput: {
              ...omit(textResponseBlock, [
                '__typename',
                'parentOrder',
                'placeholder',
                'hint',
                'minRows',
                'type',
                'routeId',
                'integrationId',
                'required'
              ]),
              journeyId: journey.id
            },
            buttonInput: {
              id: buttonBlock.id,
              journeyId: journey.id,
              parentBlockId: buttonBlock.parentBlockId,
              label: buttonBlock.label,
              variant: buttonBlock.buttonVariant,
              color: buttonBlock.buttonColor,
              size: buttonBlock.size,
              submitEnabled: buttonBlock.submitEnabled
            },
            buttonId: buttonBlock.id,
            buttonUpdateInput: {
              startIconId: buttonBlock.startIconId,
              endIconId: buttonBlock.endIconId
            },
            startIconInput: {
              id: buttonBlock.startIconId,
              journeyId: journey.id,
              parentBlockId: buttonBlock.id,
              name: null
            },
            endIconInput: {
              id: buttonBlock.endIconId,
              journeyId: journey.id,
              parentBlockId: buttonBlock.id,
              name: null
            },
            bodyInput: {
              ...omit(body, ['__typename', 'parentOrder']),
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
            textResponse: textResponseBlock,
            button: buttonBlock,
            startIcon: {
              id: buttonBlock.startIconId,
              parentBlockId: buttonBlock.id,
              parentOrder: null,
              iconName: null,
              iconSize: null,
              iconColor: null,
              __typename: 'IconBlock' as const
            },
            endIcon: {
              id: buttonBlock.endIconId,
              parentBlockId: buttonBlock.id,
              parentOrder: null,
              iconName: null,
              iconSize: null,
              iconColor: null,
              __typename: 'IconBlock' as const
            },
            buttonUpdate: {
              ...buttonBlock,
              startIconId: buttonBlock.startIconId,
              endIconId: buttonBlock.endIconId
            },
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
                    const keys = Object.keys(data).filter(
                      (key) =>
                        key !== 'cardBlockUpdate' && key !== 'buttonUpdate'
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
          }
        })
      },
      undo() {
        void cardFormDelete({
          variables: {
            imageId: imageBlock.id,
            bodyId: body.id,
            textResponseId: textResponseBlock.id,
            titleId: title.id,
            subtitleId: subtitle.id,
            buttonId: buttonBlock.id,
            startIconId: buttonBlock.startIconId,
            endIconId: buttonBlock.endIconId,
            journeyId: journey.id,
            cardId: cardBlock.id,
            cardInput: { fullscreen: !cardBlock.fullscreen }
          },
          optimisticResponse: {
            image: [],
            body: [],
            textResponse: [],
            title: [],
            subtitle: [],
            button: [],
            startIcon: [],
            endIcon: [],
            cardBlockUpdate: { ...cardBlock, fullscreen: !cardBlock.fullscreen }
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
        void cardFormRestore({
          variables: {
            imageId: imageBlock.id,
            bodyId: body.id,
            textResponseId: textResponseBlock.id,
            titleId: title.id,
            subtitleId: subtitle.id,
            buttonId: buttonBlock.id,
            startIconId: buttonBlock.startIconId,
            endIconId: buttonBlock.endIconId,
            journeyId: journey.id,
            cardId: cardBlock.id,
            cardInput: { fullscreen: cardBlock.fullscreen }
          },
          optimisticResponse: {
            image: [imageBlock],
            subtitle: [subtitle],
            title: [title],
            textResponse: [textResponseBlock],
            button: [buttonBlock],
            startIcon: [
              {
                id: buttonBlock.startIconId,
                parentBlockId: buttonBlock.id,
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                __typename: 'IconBlock' as const
              }
            ],
            endIcon: [
              {
                id: buttonBlock.endIconId,
                parentBlockId: buttonBlock.id,
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                __typename: 'IconBlock' as const
              }
            ],
            body: [body],
            cardBlockUpdate: cardBlock
          },
          update(cache, { data }) {
            if (data == null) return
            const keys = Object.keys(data).filter(
              (key) => key !== 'cardBlockUpdate'
            )
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
        height={195}
        layout="responsive"
        src={cardFormImage}
        alt="Card Form Template"
        draggable={false}
      />
    </ButtonBase>
  )
}

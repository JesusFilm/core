import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/BlockFields'
import type { ButtonBlockCreate } from '../../../../../../../../__generated__/ButtonBlockCreate'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  TypographyVariant
} from '../../../../../../../../__generated__/globalTypes'
import type { TextResponseBlockCreate } from '../../../../../../../../__generated__/TextResponseBlockCreate'
import type { TypographyBlockCreate } from '../../../../../../../../__generated__/TypographyBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand/useBlockCreateCommand'
import { Button } from '../Button'

export const TYPOGRAPHY_BLOCK_CREATE = gql`
  ${TYPOGRAPHY_FIELDS}
  mutation TypographyBlockCreate($input: TypographyBlockCreateInput!) {
    typographyBlockCreate(input: $input) {
      id
      parentBlockId
      ...TypographyFields
    }
  }
`

export const TEXT_RESPONSE_BLOCK_CREATE = gql`
  ${TEXT_RESPONSE_FIELDS}
  mutation TextResponseBlockCreate($input: TextResponseBlockCreateInput!) {
    textResponseBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...TextResponseFields
    }
  }
`

export const BUTTON_BLOCK_CREATE = gql`
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation ButtonBlockCreate(
    $input: ButtonBlockCreateInput!
    $iconBlockCreateInput1: IconBlockCreateInput!
    $iconBlockCreateInput2: IconBlockCreateInput!
    $id: ID!
    $journeyId: ID!
    $updateInput: ButtonBlockUpdateInput!
  ) {
    buttonBlockCreate(input: $input) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $iconBlockCreateInput1) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $iconBlockCreateInput2) {
      ...IconFields
    }
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $updateInput) {
      ...ButtonFields
    }
  }
`

export function NewTextResponseButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [typographyBlockCreate] = useMutation<TypographyBlockCreate>(
    TYPOGRAPHY_BLOCK_CREATE
  )
  const [textResponseBlockCreate, { loading: textResponseLoading }] =
    useMutation<TextResponseBlockCreate>(TEXT_RESPONSE_BLOCK_CREATE)
  const [buttonBlockCreate, { loading: buttonLoading }] =
    useMutation<ButtonBlockCreate>(BUTTON_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card == null || journey == null) return

    // Check for existing submit buttons in the card
    const hasSubmitButton = card.children.some(
      (block) =>
        block.__typename === 'ButtonBlock' &&
        (block as TreeBlock<ButtonBlock>).submitEnabled === true
    )

    // Create typography block first
    const typographyBlock: TypographyBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      align: null,
      color: null,
      content: '',
      variant: TypographyVariant.body2,
      __typename: 'TypographyBlock'
    }

    addBlock({
      block: typographyBlock,
      execute() {
        void typographyBlockCreate({
          variables: {
            input: {
              id: typographyBlock.id,
              journeyId: journey.id,
              parentBlockId: typographyBlock.parentBlockId,
              content: typographyBlock.content,
              variant: typographyBlock.variant
            }
          },
          optimisticResponse: {
            typographyBlockCreate: typographyBlock
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey?.id, data?.typographyBlockCreate)
          }
        })
      }
    })

    // Create text response block
    const textResponseBlock: TextResponseBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: (card.children.length ?? 0) + 1,
      label: t('Your answer here'),
      hint: null,
      minRows: null,
      type: null,
      routeId: null,
      integrationId: null,
      __typename: 'TextResponseBlock'
    }

    addBlock({
      block: textResponseBlock,
      execute() {
        void textResponseBlockCreate({
          variables: {
            input: {
              id: textResponseBlock.id,
              journeyId: journey.id,
              parentBlockId: textResponseBlock.parentBlockId,
              label: textResponseBlock.label
            }
          },
          optimisticResponse: {
            textResponseBlockCreate: textResponseBlock
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey?.id, data?.textResponseBlockCreate)
          }
        })
      }
    })

    // If no submit button exists, create one
    if (!hasSubmitButton) {
      const button: ButtonBlock = {
        id: uuidv4(),
        __typename: 'ButtonBlock',
        parentBlockId: card.id,
        label: t('Submit'),
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        parentOrder: (card.children.length ?? 0) + 2,
        startIconId: uuidv4(),
        endIconId: uuidv4(),
        action: null,
        submitEnabled: true
      }

      addBlock({
        block: button,
        execute() {
          void buttonBlockCreate({
            variables: {
              input: {
                id: button.id,
                journeyId: journey.id,
                parentBlockId: button.parentBlockId,
                label: button.label,
                variant: button.buttonVariant,
                color: button.buttonColor,
                size: button.size,
                submitEnabled: true
              },
              iconBlockCreateInput1: {
                id: button.startIconId,
                journeyId: journey.id,
                parentBlockId: button.id,
                name: null
              },
              iconBlockCreateInput2: {
                id: button.endIconId,
                journeyId: journey.id,
                parentBlockId: button.id,
                name: null
              },
              id: button.id,
              journeyId: journey.id,
              updateInput: {
                startIconId: button.startIconId,
                endIconId: button.endIconId
              }
            },
            optimisticResponse: {
              buttonBlockCreate: button,
              startIcon: {
                id: button.startIconId as string,
                parentBlockId: button.id,
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                __typename: 'IconBlock'
              },
              endIcon: {
                id: button.endIconId as string,
                parentBlockId: button.id,
                parentOrder: null,
                iconName: null,
                iconSize: null,
                iconColor: null,
                __typename: 'IconBlock'
              },
              buttonBlockUpdate: button
            },
            update(cache, { data }) {
              blockCreateUpdate(cache, journey.id, data?.startIcon)
              blockCreateUpdate(cache, journey.id, data?.endIcon)
              blockCreateUpdate(cache, journey.id, data?.buttonBlockUpdate)
            }
          })
        }
      })
    }

    // set focus to typography block
    dispatch({
      type: 'SetSelectedBlockByIdAction',
      selectedBlockId: typographyBlock.id
    })
  }

  return (
    <Button
      icon={<TextInput1Icon />}
      value={t('Text Input')}
      onClick={handleClick}
      testId="NewTextResponseButton"
      disabled={textResponseLoading || buttonLoading}
    />
  )
}

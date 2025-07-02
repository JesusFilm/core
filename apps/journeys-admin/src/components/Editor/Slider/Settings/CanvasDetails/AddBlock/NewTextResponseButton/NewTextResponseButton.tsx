import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'
import TextInput1Icon from '@core/shared/ui/icons/TextInput1'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../__generated__/BlockFields'
import {
  ButtonAlignment,
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'
import { TextResponseBlockCreate } from '../../../../../../../../__generated__/TextResponseBlockCreate'
import { useTextResponseWithButtonCreate } from '../../../../../../../libs/useTextResponseWithButtonCreate'
import { useTextResponseWithButtonDelete } from '../../../../../../../libs/useTextResponseWithButtonDelete'
import { useTextResponseWithButtonRestore } from '../../../../../../../libs/useTextResponseWithButtonRestore'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand/useBlockCreateCommand'
import { Button } from '../Button'

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

export function NewTextResponseButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseBlockCreate, { loading: textResponseLoading }] =
    useMutation<TextResponseBlockCreate>(TEXT_RESPONSE_BLOCK_CREATE)

  const [
    createTextResponseWithButton,
    { loading: textResponseWithButtonLoading }
  ] = useTextResponseWithButtonCreate()
  const [removeTextResponseWithButton] = useTextResponseWithButtonDelete()
  const [restoreTextResponseWithButton] = useTextResponseWithButtonRestore()

  const { journey } = useJourney()
  const {
    state: { selectedStep, selectedBlockId },
    dispatch
  } = useEditor()
  const { add } = useCommand()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card == null || journey == null) return

    const previousBlockId = selectedBlockId

    const hasSubmitButton = card.children.some(
      (block) =>
        block.__typename === 'ButtonBlock' &&
        (block as TreeBlock<ButtonBlock>).submitEnabled === true
    )

    const textResponseBlock: TextResponseBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      label: t('Label'),
      placeholder: null,
      hint: null,
      minRows: null,
      type: null,
      routeId: null,
      integrationId: null,
      required: null,
      __typename: 'TextResponseBlock'
    }

    if (!hasSubmitButton) {
      const buttonBlock: ButtonBlock = {
        id: uuidv4(),
        __typename: 'ButtonBlock',
        parentBlockId: card.id,
        label: '',
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        parentOrder: card.children.length + 1,
        startIconId: uuidv4(),
        endIconId: uuidv4(),
        action: null,
        submitEnabled: true,
        settings: {
          __typename: 'ButtonBlockSettings',  
          alignment: ButtonAlignment.justify
        }
      }

      const blocks = { textResponseBlock, buttonBlock }

      add({
        parameters: {
          execute: {},
          undo: { previousBlockId },
          redo: { textResponseId: textResponseBlock.id }
        },
        execute() {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: textResponseBlock.id,
            activeSlide: ActiveSlide.Content
          })
          createTextResponseWithButton(blocks, journey.id)
        },
        undo({ previousBlockId }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: previousBlockId,
            activeSlide: ActiveSlide.Content
          })
          removeTextResponseWithButton(blocks, journey.id)
        },
        redo({ textResponseId }) {
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: textResponseId,
            activeSlide: ActiveSlide.Content
          })
          restoreTextResponseWithButton(blocks, journey.id)
        }
      })
    } else {
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
              blockCreateUpdate(
                cache,
                journey.id,
                data?.textResponseBlockCreate
              )
            }
          })
        }
      })
    }
  }

  return (
    <Button
      icon={<TextInput1Icon />}
      value={t('Response Field')}
      onClick={handleClick}
      testId="NewTextResponseButton"
      disabled={textResponseLoading || textResponseWithButtonLoading}
    />
  )
}

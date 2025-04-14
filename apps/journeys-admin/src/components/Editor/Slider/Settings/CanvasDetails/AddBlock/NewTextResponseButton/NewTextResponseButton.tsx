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
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'
import { TextResponseBlockCreate } from '../../../../../../../../__generated__/TextResponseBlockCreate'
import {
  getNewParentOrder,
  useBlockOrderUpdateMutation
} from '../../../../../../../libs/useBlockOrderUpdateMutation'
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

  // Add the blockOrderUpdate mutation for updating block orders
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()

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

    console.log('Card found:', card.id, 'with children:', card.children.length)

    const previousBlockId = selectedBlockId

    const hasSubmitButton = card.children.some(
      (block) =>
        block.__typename === 'ButtonBlock' &&
        (block as TreeBlock<ButtonBlock>).submitEnabled === true
    )

    console.log('Has submit button:', hasSubmitButton)

    const textResponseBlock: TextResponseBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0, // Note: parentOrder set by resolver, not by us
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

    console.log('Created textResponseBlock with ID:', textResponseBlock.id)

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
        submitEnabled: true
      }

      const blocks = { textResponseBlock, buttonBlock }

      console.log(
        'Creating TextResponse with Button, IDs:',
        textResponseBlock.id,
        buttonBlock.id
      )

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
      // Implement the new placement logic for TextResponseBlock when submit button exists

      // 1. Find the submit button's position in the card
      const submitButtonIndex = card.children.findIndex(
        (block) =>
          block.__typename === 'ButtonBlock' &&
          (block as TreeBlock<ButtonBlock>).submitEnabled === true
      )

      console.log('Submit button found at index:', submitButtonIndex)

      const targetPosition = submitButtonIndex
      console.log('Target position for new TextResponseBlock:', targetPosition)

      addBlock({
        block: textResponseBlock,
        execute() {
          console.log('Executing TextResponseBlock creation')
          // 2. Create the TextResponseBlock (resolver will place it at the end by default)
          void textResponseBlockCreate({
            variables: {
              input: {
                id: textResponseBlock.id,
                journeyId: journey.id,
                parentBlockId: textResponseBlock.parentBlockId,
                label: textResponseBlock.label
                // Note: We don't set parentOrder here - it's set by the resolver
              }
            },
            optimisticResponse: {
              textResponseBlockCreate: textResponseBlock
            },
            update(cache, { data }) {
              console.log('TextResponseBlock create response:', data)

              if (data?.textResponseBlockCreate == null) {
                console.error('TextResponseBlock create response is null')
                return
              }

              // 3. First update the cache with the new block
              console.log('Updating cache with new block')
              blockCreateUpdate(cache, journey.id, data.textResponseBlockCreate)

              // 4. Immediately move the block above the submit button to prevent UI jumping
              // We update the client-side cache first for a smooth visual transition
              const updatedBlock = {
                ...data.textResponseBlockCreate,
                parentOrder: targetPosition
              }

              console.log('Updating block order in cache:', updatedBlock)

              try {
                // 5. Update the cache manually to reflect new order before sending mutation
                // This prevents the visual "jumping" effect as both operations appear as one
                console.log('manually updating cache')
                cache.modify({
                  id: cache.identify({ __typename: 'CardBlock', id: card.id }),
                  fields: {
                    children(existingChildren = []) {
                      console.log('Existing children:', existingChildren.length)
                      // Create new children array with updated order
                      const newOrder = getNewParentOrder(
                        [card],
                        updatedBlock as TreeBlock,
                        targetPosition
                      )

                      console.log('New order calculated:', newOrder.length)

                      return newOrder.map(({ id, parentOrder, __typename }) => {
                        const block = existingChildren.find(
                          (child) => child.id === id
                        )
                        if (block == null) {
                          console.warn('Block not found in cache for ID:', id)
                        }
                        return { ...block, parentOrder }
                      })
                    }
                  }
                })
              } catch (error) {
                console.error('Error updating cache:', error)
              }

              // 6. Send the actual blockOrderUpdate mutation to persist changes on server
              console.log('Sending blockOrderUpdate mutation')
              void blockOrderUpdate({
                variables: {
                  id: data.textResponseBlockCreate.id,
                  parentOrder: targetPosition
                },
                optimisticResponse: {
                  blockOrderUpdate: [
                    {
                      id: data.textResponseBlockCreate.id,
                      parentOrder: targetPosition,
                      __typename: 'TextResponseBlock'
                    }
                  ]
                }
              })
                .then((result) => {
                  console.log('blockOrderUpdate result:', result)
                })
                .catch((error) => {
                  console.error(
                    'blockOrderUpdate error:',
                    error,
                    data.textResponseBlockCreate.id
                  )
                })
            }
          }).catch((error) => {
            console.error('TextResponseBlock create error:', error)
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

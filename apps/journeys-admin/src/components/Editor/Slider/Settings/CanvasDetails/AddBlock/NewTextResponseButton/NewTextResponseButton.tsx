import { Reference, gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
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

export const TEXT_RESPONSE_WITH_BUTTON_CREATE = gql`
  ${TEXT_RESPONSE_FIELDS}
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation TextResponseWithButtonCreate(
    $textResponseInput: TextResponseBlockCreateInput!
    $buttonInput: ButtonBlockCreateInput!
    $iconInput1: IconBlockCreateInput!
    $iconInput2: IconBlockCreateInput!
    $buttonId: ID!
    $journeyId: ID!
    $buttonUpdateInput: ButtonBlockUpdateInput!
  ) {
    textResponse: textResponseBlockCreate(input: $textResponseInput) {
      ...TextResponseFields
    }
    button: buttonBlockCreate(input: $buttonInput) {
      ...ButtonFields
    }
    startIcon: iconBlockCreate(input: $iconInput1) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $iconInput2) {
      ...IconFields
    }
    buttonUpdate: buttonBlockUpdate(
      id: $buttonId
      journeyId: $journeyId
      input: $buttonUpdateInput
    ) {
      ...ButtonFields
    }
  }
`

export const TEXT_RESPONSE_WITH_BUTTON_DELETE = gql`
  mutation TextResponseWithButtonDelete(
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
    textResponse: blockDelete(id: $textResponseId) {
      id
      parentOrder
    }
    button: blockDelete(id: $buttonId) {
      id
      parentOrder
    }
    startIcon: blockDelete(id: $startIconId) {
      id
      parentOrder
    }
    endIcon: blockDelete(id: $endIconId) {
      id
      parentOrder
    }
  }
`

export const TEXT_RESPONSE_WITH_BUTTON_RESTORE = gql`
  ${BLOCK_FIELDS}
  mutation TextResponseWithButtonRestore(
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
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
  }
`

export function NewTextResponseButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseBlockCreate, { loading: textResponseLoading }] =
    useMutation<TextResponseBlockCreate>(TEXT_RESPONSE_BLOCK_CREATE)
  const [textResponseWithButtonCreate] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_CREATE
  )
  const [textResponseWithButtonDelete] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_DELETE
  )
  const [textResponseWithButtonRestore] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_RESTORE
  )

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

    // Store the current selected block ID to restore on undo
    const previousBlockId = selectedBlockId

    // Check for existing submit buttons in the card
    const hasSubmitButton = card.children.some(
      (block) =>
        block.__typename === 'ButtonBlock' &&
        (block as TreeBlock<ButtonBlock>).submitEnabled === true
    )

    const textResponseBlock: TextResponseBlock = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      label: t('Your answer here'),
      hint: null,
      minRows: null,
      type: null,
      routeId: null,
      integrationId: null,
      __typename: 'TextResponseBlock'
    }

    // If there's no submit button already, create one along with the text response
    if (!hasSubmitButton) {
      const buttonBlock = {
        id: uuidv4(),
        __typename: 'ButtonBlock',
        parentBlockId: card.id,
        label: t('Submit'),
        buttonVariant: ButtonVariant.contained,
        buttonColor: ButtonColor.primary,
        size: ButtonSize.medium,
        parentOrder: card.children.length + 1,
        startIconId: uuidv4(),
        endIconId: uuidv4(),
        action: null,
        submitEnabled: true
      }

      const createdBlocks = [textResponseBlock, buttonBlock]

      const buttonOptimisticResponse = {
        textResponse: textResponseBlock,
        button: buttonBlock,
        startIcon: {
          id: buttonBlock.startIconId,
          parentBlockId: buttonBlock.id,
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        endIcon: {
          id: buttonBlock.endIconId,
          parentBlockId: buttonBlock.id,
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        buttonUpdate: buttonBlock
      }

      add({
        parameters: {
          execute: { previousBlockId },
          undo: { previousBlockId },
          redo: { textResponseId: textResponseBlock.id }
        },
        execute({ previousBlockId }) {
          // Set focus to the new text response block
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: textResponseBlock.id,
            activeSlide: ActiveSlide.Content
          })

          void textResponseWithButtonCreate({
            variables: {
              textResponseInput: {
                id: textResponseBlock.id,
                journeyId: journey.id,
                parentBlockId: textResponseBlock.parentBlockId,
                label: textResponseBlock.label
              },
              buttonInput: {
                id: buttonBlock.id,
                journeyId: journey.id,
                parentBlockId: buttonBlock.parentBlockId,
                label: buttonBlock.label,
                variant: buttonBlock.buttonVariant,
                color: buttonBlock.buttonColor,
                size: buttonBlock.size,
                submitEnabled: true
              },
              iconInput1: {
                id: buttonBlock.startIconId,
                journeyId: journey.id,
                parentBlockId: buttonBlock.id,
                name: null
              },
              iconInput2: {
                id: buttonBlock.endIconId,
                journeyId: journey.id,
                parentBlockId: buttonBlock.id,
                name: null
              },
              buttonId: buttonBlock.id,
              journeyId: journey.id,
              buttonUpdateInput: {
                startIconId: buttonBlock.startIconId,
                endIconId: buttonBlock.endIconId
              }
            },
            optimisticResponse: buttonOptimisticResponse,
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
                        (key) => key !== 'buttonUpdate'
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
        undo({ previousBlockId }) {
          // Restore focus to the previous block
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: previousBlockId,
            activeSlide: ActiveSlide.Content
          })

          void textResponseWithButtonDelete({
            variables: {
              textResponseId: textResponseBlock.id,
              buttonId: buttonBlock.id,
              startIconId: buttonBlock.startIconId,
              endIconId: buttonBlock.endIconId
            },
            optimisticResponse: {
              textResponse: [],
              button: [],
              startIcon: [],
              endIcon: []
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
        redo({ textResponseId }) {
          // Set focus back to the text response block
          dispatch({
            type: 'SetEditorFocusAction',
            selectedBlockId: textResponseId,
            activeSlide: ActiveSlide.Content
          })

          void textResponseWithButtonRestore({
            variables: {
              textResponseId: textResponseBlock.id,
              buttonId: buttonBlock.id,
              startIconId: buttonBlock.startIconId,
              endIconId: buttonBlock.endIconId
            },
            optimisticResponse: {
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
                  __typename: 'IconBlock'
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
                  __typename: 'IconBlock'
                }
              ]
            },
            update(cache, { data }) {
              if (data == null) return
              const keys = Object.keys(data).filter(
                (key) => key !== 'cardBlockUpdate'
              )
              keys.forEach((key) => {
                data[key].forEach((block) => {
                  cache.modify({
                    id: cache.identify({
                      __typename: 'Journey',
                      id: journey.id
                    }),
                    fields: {
                      blocks(existingBlockRefs: Reference[], { readField }) {
                        const NEW_BLOCK_FRAGMENT = gql`
                          fragment NewBlock on Block {
                            id
                            parentOrder
                            parentBlockId
                          }
                        `
                        if (
                          existingBlockRefs.some(
                            (ref) => readField('id', ref) === block.id
                          )
                        ) {
                          return existingBlockRefs
                        }

                        // Use original parentOrder values for known blocks
                        let blockData = block
                        if (block.id === textResponseBlock.id) {
                          blockData = {
                            ...block,
                            parentOrder: textResponseBlock.parentOrder
                          }
                        } else if (block.id === buttonBlock.id) {
                          blockData = {
                            ...block,
                            parentOrder: buttonBlock.parentOrder
                          }
                        }

                        return [
                          ...existingBlockRefs,
                          cache.writeFragment({
                            data: blockData,
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
    } else {
      // If there's already a submit button, just create the text response block (original behavior)
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
      value={t('Text Input')}
      onClick={handleClick}
      testId="NewTextResponseButton"
      disabled={textResponseLoading}
    />
  )
}

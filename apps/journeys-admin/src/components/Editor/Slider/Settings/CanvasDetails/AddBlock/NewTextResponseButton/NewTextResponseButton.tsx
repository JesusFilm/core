import { ApolloCache, Reference, gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
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
  ${TEXT_RESPONSE_FIELDS}
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation TextResponseWithButtonRestore(
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
    textResponse: blockRestore(id: $textResponseId) {
      ...TextResponseFields
    }
    button: blockRestore(id: $buttonId) {
      ...ButtonFields
    }
    startIcon: blockRestore(id: $startIconId) {
      ...IconFields
    }
    endIcon: blockRestore(id: $endIconId) {
      ...IconFields
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
    state: { selectedStep }
  } = useEditor()
  const { add } = useCommand()
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
        textResponse: {
          id: textResponseBlock.id,
          parentBlockId: textResponseBlock.parentBlockId,
          parentOrder: textResponseBlock.parentOrder,
          label: textResponseBlock.label,
          hint: null,
          minRows: null,
          type: null,
          routeId: null,
          integrationId: null,
          __typename: 'TextResponseBlock'
        },
        button: {
          id: buttonBlock.id,
          parentBlockId: buttonBlock.parentBlockId,
          parentOrder: buttonBlock.parentOrder,
          label: buttonBlock.label,
          buttonVariant: buttonBlock.buttonVariant,
          buttonColor: buttonBlock.buttonColor,
          size: buttonBlock.size,
          startIconId: buttonBlock.startIconId,
          endIconId: buttonBlock.endIconId,
          submitEnabled: buttonBlock.submitEnabled,
          action: null,
          __typename: 'ButtonBlock'
        },
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
        buttonUpdate: {
          id: buttonBlock.id,
          parentBlockId: buttonBlock.parentBlockId,
          parentOrder: buttonBlock.parentOrder,
          label: buttonBlock.label,
          buttonVariant: buttonBlock.buttonVariant,
          buttonColor: buttonBlock.buttonColor,
          size: buttonBlock.size,
          startIconId: buttonBlock.startIconId,
          endIconId: buttonBlock.endIconId,
          submitEnabled: buttonBlock.submitEnabled,
          action: null,
          __typename: 'ButtonBlock'
        }
      }

      add({
        parameters: { execute: {}, undo: {} },
        execute() {
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
        undo() {
          void textResponseWithButtonDelete({
            variables: {
              textResponseId: textResponseBlock.id,
              buttonId: buttonBlock.id,
              startIconId: buttonBlock.startIconId,
              endIconId: buttonBlock.endIconId
            },
            update(cache, { data }) {
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
          void textResponseWithButtonRestore({
            variables: {
              textResponseId: textResponseBlock.id,
              buttonId: buttonBlock.id,
              startIconId: buttonBlock.startIconId,
              endIconId: buttonBlock.endIconId
            },
            optimisticResponse: {
              textResponse: buttonOptimisticResponse.textResponse,
              button: buttonOptimisticResponse.button,
              startIcon: buttonOptimisticResponse.startIcon,
              endIcon: buttonOptimisticResponse.endIcon
            },
            update(cache, { data }) {
              if (data != null) {
                Object.keys(data).forEach((key) => {
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
                          }
                        `
                        if (
                          existingBlockRefs.some(
                            (ref) => readField('id', ref) === data[key].id
                          )
                        ) {
                          return existingBlockRefs
                        }
                        return [
                          ...existingBlockRefs,
                          cache.writeFragment({
                            data: data[key],
                            fragment: NEW_BLOCK_FRAGMENT
                          })
                        ]
                      }
                    }
                  })
                })
              }
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

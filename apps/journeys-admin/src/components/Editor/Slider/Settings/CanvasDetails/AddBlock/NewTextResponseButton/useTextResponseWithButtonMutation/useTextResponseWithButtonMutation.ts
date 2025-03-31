import { MutationResult, Reference, gql, useMutation } from '@apollo/client'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../../../../../../../__generated__/BlockFields'

const NEW_BLOCK_FRAGMENT = gql`
  fragment NewBlock on Block {
    id
  }
`

/**
 * Mutation to create a text response block with an associated submit button
 */
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

/**
 * Mutation to delete a text response block and its associated button
 */
export const TEXT_RESPONSE_WITH_BUTTON_DELETE = gql`
  mutation TextResponseWithButtonDelete(
    $textResponseId: ID!
    $buttonId: ID!
    $startIconId: ID!
    $endIconId: ID!
  ) {
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
  }
`

/**
 * Mutation to restore a previously deleted text response block and its associated button
 */
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

interface TextResponseWithButtonBlocks {
  textResponseBlock: TextResponseBlock
  buttonBlock: ButtonBlock
}

interface TextResponseWithButtonMutationResult {
  create: (blocks: TextResponseWithButtonBlocks, journeyId: string) => void
  remove: (blocks: TextResponseWithButtonBlocks, journeyId: string) => void
  restore: (blocks: TextResponseWithButtonBlocks, journeyId: string) => void
  result: MutationResult
}

export function useTextResponseWithButtonMutation(): TextResponseWithButtonMutationResult {
  const [textResponseWithButtonCreate, createResult] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_CREATE
  )
  const [textResponseWithButtonDelete] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_DELETE
  )
  const [textResponseWithButtonRestore] = useMutation(
    TEXT_RESPONSE_WITH_BUTTON_RESTORE
  )

  /** Creates a new text response block with an associated submit button and updates the cache optimistically */
  function createTextResponseWithButton(
    { textResponseBlock, buttonBlock }: TextResponseWithButtonBlocks,
    journeyId: string
  ): void {
    void textResponseWithButtonCreate({
      variables: {
        textResponseInput: {
          id: textResponseBlock.id,
          journeyId,
          parentBlockId: textResponseBlock.parentBlockId,
          label: textResponseBlock.label
        },
        buttonInput: {
          id: buttonBlock.id,
          journeyId,
          parentBlockId: buttonBlock.parentBlockId,
          label: buttonBlock.label,
          variant: buttonBlock.buttonVariant,
          color: buttonBlock.buttonColor,
          size: buttonBlock.size,
          submitEnabled: true
        },
        iconInput1: {
          id: buttonBlock.startIconId,
          journeyId,
          parentBlockId: buttonBlock.id,
          name: null
        },
        iconInput2: {
          id: buttonBlock.endIconId,
          journeyId,
          parentBlockId: buttonBlock.id,
          name: null
        },
        buttonId: buttonBlock.id,
        journeyId,
        buttonUpdateInput: {
          startIconId: buttonBlock.startIconId,
          endIconId: buttonBlock.endIconId
        }
      },
      optimisticResponse: {
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
      },
      update(cache, { data }) {
        if (data == null) return

        cache.modify({
          id: cache.identify({ __typename: 'Journey', id: journeyId }),
          fields: {
            blocks(existingBlockRefs = []) {
              const keys = Object.keys(data).filter(
                (key) => key !== 'buttonUpdate'
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
      }
    })
  }

  /** Removes a text response block and its associated submit button from the card */
  function deleteTextResponseWithButton(
    { textResponseBlock, buttonBlock }: TextResponseWithButtonBlocks,
    journeyId: string
  ): void {
    const createdBlocks = [textResponseBlock, buttonBlock]
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
            id: cache.identify({ __typename: 'Journey', id: journeyId }),
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
  }

  /** Restores a previously deleted text response block and its associated submit button to the card */
  function restoreTextResponseWithButton(
    { textResponseBlock, buttonBlock }: TextResponseWithButtonBlocks,
    journeyId: string
  ): void {
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

        const keys = Object.keys(data)
        keys.forEach((key) => {
          data[key].forEach((block: any) => {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journeyId }),
              fields: {
                blocks(existingBlockRefs: Reference[], { readField }) {
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

  return {
    create: createTextResponseWithButton,
    remove: deleteTextResponseWithButton,
    restore: restoreTextResponseWithButton,
    result: createResult
  }
}

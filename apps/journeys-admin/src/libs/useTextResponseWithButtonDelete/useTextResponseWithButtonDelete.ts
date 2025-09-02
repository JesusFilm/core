import { Reference, gql, useMutation } from '@apollo/client'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../__generated__/BlockFields'
import {
  TextResponseWithButtonDelete,
  TextResponseWithButtonDeleteVariables
} from '../../../__generated__/TextResponseWithButtonDelete'

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

interface TextResponseWithButtonBlocks {
  textResponseBlock: TextResponseBlock
  buttonBlock: ButtonBlock
}

/**
 * Hook that provides a function to delete a text response block with its associated submit button.
 * Used in the undo function of newTextResponseButton.tsx
 */
export function useTextResponseWithButtonDelete(): [
  (blocks: TextResponseWithButtonBlocks, journeyId: string) => void
] {
  const [textResponseWithButtonDelete] = useMutation<
    TextResponseWithButtonDelete,
    TextResponseWithButtonDeleteVariables
  >(TEXT_RESPONSE_WITH_BUTTON_DELETE)

  function deleteTextResponseWithButton(
    { textResponseBlock, buttonBlock }: TextResponseWithButtonBlocks,
    journeyId: string
  ): void {
    const createdBlocks = [textResponseBlock, buttonBlock]
    void textResponseWithButtonDelete({
      variables: {
        textResponseId: textResponseBlock.id,
        buttonId: buttonBlock.id,
        startIconId: buttonBlock.startIconId as string,
        endIconId: buttonBlock.endIconId as string
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

  return [deleteTextResponseWithButton]
}

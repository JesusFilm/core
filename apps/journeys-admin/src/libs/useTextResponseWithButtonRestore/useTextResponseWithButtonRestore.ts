import { Reference, gql, useMutation } from '@apollo/client'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../__generated__/BlockFields'
import {
  TextResponseWithButtonRestore,
  TextResponseWithButtonRestoreVariables
} from '../../../__generated__/TextResponseWithButtonRestore'

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

/**
 * Hook that provides a function to restore a text response block with its associated submit button.
 * Used in the redo function of newTextResponseButton.tsx
 */
export function useTextResponseWithButtonRestore(): [
  (blocks: TextResponseWithButtonBlocks, journeyId: string) => void
] {
  const [textResponseWithButtonRestore] = useMutation<
    TextResponseWithButtonRestore,
    TextResponseWithButtonRestoreVariables
  >(TEXT_RESPONSE_WITH_BUTTON_RESTORE)

  function restoreTextResponseWithButton(
    { textResponseBlock, buttonBlock }: TextResponseWithButtonBlocks,
    journeyId: string
  ): void {
    void textResponseWithButtonRestore({
      variables: {
        textResponseId: textResponseBlock.id,
        buttonId: buttonBlock.id,
        startIconId: buttonBlock.startIconId as string,
        endIconId: buttonBlock.endIconId as string
      },
      optimisticResponse: {
        textResponse: [textResponseBlock],
        button: [buttonBlock],
        startIcon: [
          {
            id: buttonBlock.startIconId as string,
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
            id: buttonBlock.endIconId as string,
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
                      fragment: gql`
                        fragment NewBlock on Block {
                          id
                        }
                      `
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

  return [restoreTextResponseWithButton]
}

import { MutationResult, gql, useMutation } from '@apollo/client'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_TextResponseBlock as TextResponseBlock
} from '../../../__generated__/BlockFields'
import {
  TextResponseWithButtonCreate,
  TextResponseWithButtonCreateVariables
} from '../../../__generated__/TextResponseWithButtonCreate'

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

interface TextResponseWithButtonBlocks {
  textResponseBlock: TextResponseBlock
  buttonBlock: ButtonBlock
}

/**
 * Hook that provides a function to create a text response block with its associated submit button.
 */
export function useTextResponseWithButtonCreate(): [
  (blocks: TextResponseWithButtonBlocks, journeyId: string) => void,
  MutationResult<TextResponseWithButtonCreate>
] {
  const [textResponseWithButtonCreate, createResult] = useMutation<
    TextResponseWithButtonCreate,
    TextResponseWithButtonCreateVariables
  >(TEXT_RESPONSE_WITH_BUTTON_CREATE)

  function createTextResponseWithButton(
    { textResponseBlock, buttonBlock }: TextResponseWithButtonBlocks,
    journeyId: string
  ): void {
    void textResponseWithButtonCreate({
      variables: {
        textResponseInput: {
          id: textResponseBlock.id,
          journeyId,
          parentBlockId: textResponseBlock.parentBlockId as string,
          label: textResponseBlock.label
        },
        buttonInput: {
          id: buttonBlock.id,
          journeyId,
          parentBlockId: buttonBlock.parentBlockId as string,
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
          id: buttonBlock.startIconId as string,
          parentBlockId: buttonBlock.id,
          parentOrder: null,
          iconName: null,
          iconSize: null,
          iconColor: null,
          __typename: 'IconBlock'
        },
        endIcon: {
          id: buttonBlock.endIconId as string,
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

  return [createTextResponseWithButton, createResult]
}

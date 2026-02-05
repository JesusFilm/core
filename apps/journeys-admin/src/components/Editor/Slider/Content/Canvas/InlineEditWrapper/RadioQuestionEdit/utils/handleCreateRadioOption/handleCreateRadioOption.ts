import { MutationFunction, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BlockFields_RadioOptionBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { JourneyFields } from '../../../../../../../../../../__generated__/JourneyFields'
import {
  RadioOptionBlockCreate,
  RadioOptionBlockCreateVariables
} from '../../../../../../../../../../__generated__/RadioOptionBlockCreate'

interface HandleCreateRadioOptionProps {
  dispatch: (action: any) => void
  addBlock: (params: {
    block: BlockFields_RadioOptionBlock
    execute: () => void
  }) => void
  radioOptionBlockCreate: MutationFunction<
    RadioOptionBlockCreate,
    RadioOptionBlockCreateVariables
  >
  parentBlockId: string | null
  siblingCount: number
  journey?: JourneyFields
}

/**
 * Creates a new radio option block and adds it to the radio question.
 *
 * This function creates a new radio option block with a generated UUID, adds it to the
 * command stack via addBlock, and executes a GraphQL mutation to persist it on the server.
 * The function also updates the Apollo cache and sets editor focus to the newly created block.
 *
 * The function returns early if the journey is not provided, as it's required for the mutation.
 *
 * @param {HandleCreateRadioOptionProps} props - The function parameters
 * @param {(action: any) => void} props.dispatch - Editor dispatch function to update editor state
 * @param {(params: { block: BlockFields_RadioOptionBlock; execute: () => void }) => void} props.addBlock - Function to add a block to the command stack
 * @param {MutationFunction<RadioOptionBlockCreate, RadioOptionBlockCreateVariables>} props.radioOptionBlockCreate - GraphQL mutation function to create a radio option block
 * @param {string | null} props.parentBlockId - The ID of the parent radio question block
 * @param {number | null} props.siblingCount - The number of existing sibling options (used for parentOrder)
 * @param {JourneyFields} [props.journey] - Optional journey fields. Required for the mutation to execute.
 * @returns {void}
 */
export function handleCreateRadioOption({
  dispatch,
  addBlock,
  radioOptionBlockCreate,
  parentBlockId,
  journey,
  siblingCount
}: HandleCreateRadioOptionProps): void {
  if (journey == null) return

  const radioOptionBlock: BlockFields_RadioOptionBlock = {
    id: uuidv4(),
    label: '',
    parentBlockId: parentBlockId ?? '',
    parentOrder: siblingCount,
    action: null,
    pollOptionImageBlockId: null,
    eventLabel: null,
    __typename: 'RadioOptionBlock'
  }
  addBlock({
    block: radioOptionBlock,
    execute() {
      dispatch({
        type: 'SetEditorFocusAction',
        selectedBlockId: radioOptionBlock.id
      })
      void radioOptionBlockCreate({
        variables: {
          input: {
            id: radioOptionBlock.id,
            journeyId: journey.id,
            parentBlockId: radioOptionBlock.parentBlockId ?? '',
            label: radioOptionBlock.label
          }
        },
        optimisticResponse: {
          radioOptionBlockCreate: radioOptionBlock
        },
        update(cache, { data }) {
          if (data?.radioOptionBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.radioOptionBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [...existingBlockRefs, newBlockRef]
                }
              }
            })
          }
        }
      })
    }
  })
}

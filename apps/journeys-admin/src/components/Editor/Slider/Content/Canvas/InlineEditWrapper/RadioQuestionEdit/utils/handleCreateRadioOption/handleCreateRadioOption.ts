import { MutationFunction, gql } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { TreeBlock } from '@core/journeys/ui/block'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import {
  BlockFields_RadioOptionBlock,
  BlockFields_StepBlock
} from '../../../../../../../../../../__generated__/BlockFields'
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
  journey?: JourneyFields
  selectedStep?: TreeBlock<BlockFields_StepBlock>
  siblingCount?: number | undefined
}
export function handleCreateRadioOption({
  dispatch,
  addBlock,
  radioOptionBlockCreate,
  parentBlockId,
  journey,
  selectedStep,
  siblingCount
}: HandleCreateRadioOptionProps): void {
  if (journey == null) return

  console.log('siblingCount', siblingCount)

  const parentOrder =
    siblingCount ??
    searchBlocks(selectedStep?.children ?? [], parentBlockId ?? '')?.children
      ?.length ??
    0

  const radioOptionBlock: BlockFields_RadioOptionBlock = {
    id: uuidv4(),
    label: '',
    parentBlockId: parentBlockId ?? '',
    parentOrder: parentOrder,
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

import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { WrappersProps } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RadioQuestion } from '@core/journeys/ui/RadioQuestion'

import { BlockFields_RadioOptionBlock as RadioOptionBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  RadioOptionBlockCreate,
  RadioOptionBlockCreateVariables
} from '../../../../../../../../__generated__/RadioOptionBlockCreate'
import { RadioQuestionFields } from '../../../../../../../../__generated__/RadioQuestionFields'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'

export const RADIO_OPTION_BLOCK_CREATE = gql`
  ${BLOCK_FIELDS}
  mutation RadioOptionBlockCreate($input: RadioOptionBlockCreateInput!) {
    radioOptionBlockCreate(input: $input) {
      id
      label
      ...BlockFields
    }
  }
`

interface RadioQuestionEditProps extends TreeBlock<RadioQuestionFields> {
  wrappers?: WrappersProps
}

export function RadioQuestionEdit({
  id,
  wrappers,
  ...props
}: RadioQuestionEditProps): ReactElement {
  const [radioOptionBlockCreate] = useMutation<
    RadioOptionBlockCreate,
    RadioOptionBlockCreateVariables
  >(RADIO_OPTION_BLOCK_CREATE)
  const { journey } = useJourney()
  const { addBlock } = useBlockCreateCommand()
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  function handleCreateOption(): void {
    if (journey == null) return

    const radioOptionBlock: RadioOptionBlock = {
      id: uuidv4(),
      label: '',
      parentBlockId: id,
      parentOrder: selectedBlock?.children?.length ?? 0,
      action: null,
      pollOptionImageBlockId: null,
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
              parentBlockId: radioOptionBlock.parentBlockId ?? id,
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

  return (
    <RadioQuestion
      {...props}
      id={id}
      addOption={props.children.length < 12 ? handleCreateOption : undefined}
      wrappers={wrappers}
    />
  )
}

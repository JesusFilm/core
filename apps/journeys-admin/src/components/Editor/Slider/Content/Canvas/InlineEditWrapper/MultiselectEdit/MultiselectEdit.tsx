import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { WrappersProps } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Multiselect } from '@core/journeys/ui/Multiselect'

import { BlockFields_MultiselectOptionBlock as MultiselectOptionBlock } from '../../../../../../../../__generated__/BlockFields'
import { MultiselectFields } from '../../../../../../../../__generated__/MultiselectFields'
import {
  MultiselectOptionBlockCreate,
  MultiselectOptionBlockCreateVariables
} from '../../../../../../../../__generated__/MultiselectOptionBlockCreate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'

export const MULTISELECT_OPTION_BLOCK_CREATE = gql`
  ${BLOCK_FIELDS}
  mutation MultiselectOptionBlockCreate(
    $input: MultiselectOptionBlockCreateInput!
  ) {
    multiselectOptionBlockCreate(input: $input) {
      id
      label
      ...BlockFields
    }
  }
`

interface MultiselectEditProps extends TreeBlock<MultiselectFields> {
  wrappers?: WrappersProps
}

export function MultiselectEdit({
  id,
  wrappers,
  ...props
}: MultiselectEditProps): ReactElement {
  const [multiselectOptionBlockCreate] = useMutation<
    MultiselectOptionBlockCreate,
    MultiselectOptionBlockCreateVariables
  >(MULTISELECT_OPTION_BLOCK_CREATE)
  const { journey } = useJourney()
  const { addBlock } = useBlockCreateCommand()
  const {
    state: { selectedBlock },
    dispatch
  } = useEditor()

  function handleCreateOption(): void {
    if (journey == null) return

    const option: MultiselectOptionBlock = {
      id: uuidv4(),
      label: '',
      parentBlockId: id,
      parentOrder: props.children?.length ?? 0,
      __typename: 'MultiselectOptionBlock'
    }

    addBlock({
      block: option,
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlockId: option.id
        })
        void multiselectOptionBlockCreate({
          variables: {
            input: {
              id: option.id,
              journeyId: journey.id,
              parentBlockId: option.parentBlockId ?? id,
              label: option.label
            }
          },
          optimisticResponse: {
            multiselectOptionBlockCreate: option
          },
          update(cache, { data }) {
            if (data?.multiselectOptionBlockCreate != null) {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs = []) {
                    const newBlockRef = cache.writeFragment({
                      data: data.multiselectOptionBlockCreate,
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
    <Multiselect
      {...props}
      id={id}
      addOption={
        (props.children?.length ?? 0) < 12 ? handleCreateOption : undefined
      }
      wrappers={wrappers}
    />
  )
}

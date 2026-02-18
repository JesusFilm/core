import { gql, useMutation } from '@apollo/client'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import { Dispatch, ReactElement, SetStateAction } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_SpacerBlock as SpacerBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  SpacerSpacingUpdate,
  SpacerSpacingUpdateVariables
} from '../../../../../../../../../../__generated__/SpacerSpacingUpdate'

export const SPACER_SPACING_UPDATE = gql`
  mutation SpacerSpacingUpdate($id: ID!, $spacing: Int!) {
    spacerBlockUpdate(id: $id, input: { spacing: $spacing }) {
      id
      spacing
    }
  }
`

interface SpacingProps {
  value: number
  setValue: Dispatch<SetStateAction<number>>
}

export function Spacing({ value, setValue }: SpacingProps): ReactElement {
  const [spacerSpacingUpdate] = useMutation<
    SpacerSpacingUpdate,
    SpacerSpacingUpdateVariables
  >(SPACER_SPACING_UPDATE)
  const { state } = useEditor()
  const { add } = useCommand()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<SpacerBlock>
    | undefined

  function handleChange(_event, spacing: number): void {
    setValue(spacing)
  }

  function handleSpacingChange(_event, spacing: number): void {
    if (selectedBlock == null) return
    add({
      parameters: {
        execute: { spacing },
        undo: { spacing: selectedBlock?.spacing }
      },
      execute({ spacing }) {
        void spacerSpacingUpdate({
          variables: {
            id: selectedBlock.id,
            spacing
          },
          optimisticResponse: {
            spacerBlockUpdate: {
              id: selectedBlock.id,
              spacing,
              __typename: 'SpacerBlock'
            }
          }
        }).then(() => {
          setValue(spacing)
        })
      }
    })
  }
  return (
    <Stack sx={{ p: 4, pt: 0 }} data-testid="Label">
      <Slider
        sx={{ width: '100%' }}
        min={20}
        max={400}
        step={10}
        value={value}
        onChange={handleChange}
        onChangeCommitted={handleSpacingChange}
      />
    </Stack>
  )
}

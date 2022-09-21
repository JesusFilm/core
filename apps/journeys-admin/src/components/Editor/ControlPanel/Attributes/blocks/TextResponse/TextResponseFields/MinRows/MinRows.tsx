import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ToggleButtonGroup } from '../../../../ToggleButtonGroup'
import { TextResponseMinRowsUpdate } from '../../../../../../../../../__generated__/TextResponseMinRowsUpdate'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/GetJourney'

export const TEXT_RESPONSE_MIN_ROWS_UPDATE = gql`
  mutation TextResponseMinRowsUpdate(
    $id: ID!
    $journeyId: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      minRows
    }
  }
`

export function MinRows(): ReactElement {
  const [textResponseMinRowsUpdate] = useMutation<TextResponseMinRowsUpdate>(
    TEXT_RESPONSE_MIN_ROWS_UPDATE
  )

  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleChange(minRows: number): Promise<void> {
    if (journey == null || selectedBlock == null) return
    await textResponseMinRowsUpdate({
      variables: {
        id: selectedBlock.id,
        journeyId: journey.id,
        input: {
          minRows
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          minRows
        }
      }
    })
  }

  const options = [
    {
      value: 1,
      label: 'One Row'
    },
    {
      value: 2,
      label: 'Two Rows'
    },
    {
      value: 3,
      label: 'Three Rows'
    },
    {
      value: 4,
      label: 'Four Rows'
    }
  ]

  return (
    <ToggleButtonGroup
      value={selectedBlock?.minRows ?? 3}
      onChange={handleChange}
      options={options}
    />
  )
}

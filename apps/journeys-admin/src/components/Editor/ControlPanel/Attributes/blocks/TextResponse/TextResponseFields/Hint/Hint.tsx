import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { TextResponseHintUpdate } from '../../../../../../../../../__generated__/TextResponseHintUpdate'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/GetJourney'
import { TextFieldForm } from '../../../../../../../TextFieldForm'

export const TEXT_RESPONSE_HINT_UPDATE = gql`
  mutation TextResponseHintUpdate(
    $id: ID!
    $journeyId: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      hint
    }
  }
`

export function Hint(): ReactElement {
  const [textResponseHintUpdate] = useMutation<TextResponseHintUpdate>(
    TEXT_RESPONSE_HINT_UPDATE
  )
  const { journey } = useJourney()
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleSubmit(hint: string): Promise<void> {
    if (journey == null || selectedBlock == null) return
    await textResponseHintUpdate({
      variables: {
        id: selectedBlock?.id,
        journeyId: journey.id,
        input: {
          hint
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock?.id,
          __typename: 'TextResponseBlock',
          hint
        }
      }
    })
  }

  return (
    <Box sx={{ px: 6, py: 4 }}>
      <TextFieldForm
        id="textResponseHint"
        label="Hint"
        initialValues={selectedBlock?.hint ?? ''}
        handleSubmit={handleSubmit}
        inputProps={{ maxLength: 250 }}
        disabled={selectedBlock == null}
        sx={{
          pb: selectedBlock != null ? 0 : 4
        }}
      />
    </Box>
  )
}

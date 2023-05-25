import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { TextResponseLabelUpdate } from '../../../../../../../../../__generated__/TextResponseLabelUpdate'
import { GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../__generated__/GetJourney'
import { TextFieldForm } from '../../../../../../../TextFieldForm'

export const TEXT_RESPONSE_LABEL_UPDATE = gql`
  mutation TextResponseLabelUpdate(
    $id: ID!
    $journeyId: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      label
    }
  }
`

export function Label(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [textResponseLabelUpdate] = useMutation<TextResponseLabelUpdate>(
    TEXT_RESPONSE_LABEL_UPDATE
  )
  const { journey } = useJourney()
  const { state } = useEditor()

  const selectedBlock = state.selectedBlock as
    | TreeBlock<TextResponseBlock>
    | undefined

  async function handleSubmit(label: string): Promise<void> {
    if (journey == null || selectedBlock == null) return
    await textResponseLabelUpdate({
      variables: {
        id: selectedBlock?.id,
        journeyId: journey.id,
        input: {
          label
        }
      },
      optimisticResponse: {
        textResponseBlockUpdate: {
          id: selectedBlock?.id,
          __typename: 'TextResponseBlock',
          label
        }
      }
    })
  }

  return (
    <Box sx={{ px: 6, py: 4 }}>
      <TextFieldForm
        label="Label"
        initialValues={selectedBlock?.label}
        handleSubmit={handleSubmit}
        placeholder={t('Your answer here')}
        inputProps={{ maxLength: 250 }}
        disabled={selectedBlock == null}
        sx={{
          pb: selectedBlock != null ? 0 : 4
        }}
      />
    </Box>
  )
}

import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../../../../libs/context'
import { StepFields } from '../../../../../../../../../__generated__/StepFields'
import { StepBlockNextBlockUpdate } from '../../../../../../../../../__generated__/StepBlockNextBlockUpdate'
import { CardPreview } from '../../../../../../../CardPreview'

export const STEP_BLOCK_NEXT_BLOCK_UPDATE = gql`
  mutation StepBlockNextBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: StepBlockUpdateInput!
  ) {
    stepBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      nextBlockId
    }
  }
`

export function Cards(): ReactElement {
  const [stepBlockNextBlockUpdate] = useMutation<StepBlockNextBlockUpdate>(
    STEP_BLOCK_NEXT_BLOCK_UPDATE
  )
  const {
    state: { steps, selectedBlock }
  } = useEditor()
  const journey = useJourney()
  const { id } = selectedBlock

  const nextStep: TreeBlock<StepFields> | undefined = steps.find(
    ({ id }) => selectedBlock.nextBlockId === id
  )

  async function handleSelectStep(step: TreeBlock<StepFields>): Promise<void> {
    await stepBlockNextBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: {
          nextBlockId: step.id
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id,
          journeyId: journey.id,
          __typename: 'StepBlock',
          nextBlockId: step.id
        }
      }
    })
  }

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cards
        </Typography>
      </Box>
      <CardPreview
        selected={nextStep}
        steps={steps}
        onSelect={handleSelectStep}
      />
    </>
  )
}

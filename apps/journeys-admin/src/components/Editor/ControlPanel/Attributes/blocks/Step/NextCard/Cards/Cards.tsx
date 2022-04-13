import { ReactElement } from 'react'
import { useTheme } from '@mui/material/styles'
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
  const theme = useTheme()
  const { id, nextBlockId } = selectedBlock as TreeBlock<StepFields>

  const nextStep: TreeBlock<StepFields> | undefined = steps?.find(
    ({ id }) => nextBlockId === id
  )

  async function handleSelectStep(step: TreeBlock<StepFields>): Promise<void> {
    if (journey == null) return

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
          __typename: 'StepBlock',
          nextBlockId: step.id
        }
      }
    })
  }

  return (
    <>
      <Box sx={{ pl: 6, pr: 4, pt: 4 }}>
        <Typography
          variant="subtitle2"
          sx={{ [theme.breakpoints.down('sm')]: { display: 'none' } }}
        >
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

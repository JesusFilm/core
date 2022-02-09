import { ReactElement } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { gql, useMutation } from '@apollo/client'
import { CardPreview } from '../../../../../../../CardPreview'
import { NavigateActionUpdate } from '../../../../../../../../../__generated__/NavigateActionUpdate'
import { useJourney } from '../../../../../../../../libs/context'
import { GetJourney_journey_blocks_ButtonBlock as ButtonBlock } from '../../../../../../../../../__generated__/GetJourney'

export const NAVIGATE_ACTION_UPDATE = gql`
  mutation NavigateActionUpdate(
    $id: ID!
    $journeyId: ID!
    $input: NavigateActionInput!
  ) {
    blockUpdateNavigateAction(id: $id, journeyId: $journeyId, input: $input) {
      id
      ... on ButtonBlock {
        action {
          ... on NavigateAction {
            gtmEventName
          }
        }
      }
    }
  }
`

export function NavigateNext(): ReactElement {
  const { state } = useEditor()
  const journey = useJourney()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const [navigateActionUpdate] = useMutation<NavigateActionUpdate>(
    NAVIGATE_ACTION_UPDATE
  )

  const nextStep = state.steps.find(
    (step) => step.id === state.selectedStep?.nextBlockId
  )

  async function navigateNext(): Promise<void> {
    if (selectedBlock != null) {
      await navigateActionUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: { gtmEventName: 'gtmEventName' }
        }
      })
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'absolute',
          backgroundColor: 'white',
          opacity: '40%'
        }}
      >
        <CardPreview selected={nextStep} steps={state.steps} />
        {/* Find a way to get rid of this button */}
        <button onClick={navigateNext}>ok</button>
      </Box>
      {nextStep == null && (
        <Typography variant="caption">No next card</Typography>
      )}
    </>
  )
}

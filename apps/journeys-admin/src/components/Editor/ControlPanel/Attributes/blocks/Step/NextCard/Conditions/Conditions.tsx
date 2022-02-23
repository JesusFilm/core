import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import { ReactElement } from 'react'
import Switch from '@mui/material/Switch'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { useJourney } from '../../../../../../../../libs/context'
import { StepBlockLockUpdate } from '../../../../../../../../../__generated__/StepBlockLockUpdate'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../../__generated__/GetJourney'

export const STEP_BLOCK_LOCK_UPDATE = gql`
  mutation StepBlockLockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: StepBlockUpdateInput!
  ) {
    stepBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      locked
    }
  }
`

export function Conditions(): ReactElement {
  const [stepBlockLockUpdate] = useMutation<StepBlockLockUpdate>(
    STEP_BLOCK_LOCK_UPDATE
  )

  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as TreeBlock<StepBlock>
  const journey = useJourney()

  const checked = selectedBlock.locked
  async function handleChange(): Promise<void> {
    if (selectedBlock != null && selectedBlock.__typename === 'StepBlock') {
      await stepBlockLockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input: {
            locked: !checked,
            nextBlockId: selectedBlock.nextBlockId
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: selectedBlock.id,
            __typename: 'StepBlock',
            locked: !checked
          }
        }
      })
    }
  }
  return (
    <Stack>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          pb: 4
        }}
      >
        <Box>
          <Typography variant="body1">Lock the next step</Typography>
          <Typography variant="caption" color="text.secondary">
            Don&apos;t allow to skip the current card
          </Typography>
        </Box>
        <Switch checked={checked} onChange={handleChange} sx={{ ml: 'auto' }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <InfoOutlinedIcon sx={{ mr: 4 }} />
        <Typography variant="caption" color="text.secondary">
          User can&apos;t skip interaction on the current card, like watching
          video or interacting with questions.
        </Typography>
      </Box>
    </Stack>
  )
}

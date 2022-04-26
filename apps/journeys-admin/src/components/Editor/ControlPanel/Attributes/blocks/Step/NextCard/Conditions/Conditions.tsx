import { ReactElement } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { TreeBlock, useEditor } from '@core/journeys/ui'
import { useJourney } from '../../../../../../../../libs/context'
import { StepFields } from '../../../../../../../../../__generated__/StepFields'

import { StepBlockLockUpdate } from '../../../../../../../../../__generated__/StepBlockLockUpdate'
import { ToggleOption } from '../../../../ToggleOption'

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
  const {
    state: { selectedBlock }
  } = useEditor()
  const journey = useJourney()
  const theme = useTheme()
  const block = selectedBlock as TreeBlock<StepFields>

  async function handleChange(): Promise<void> {
    if (journey == null) return

    await stepBlockLockUpdate({
      variables: {
        id: block.id,
        journeyId: journey.id,
        input: {
          locked: !block.locked
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id: block.id,
          __typename: 'StepBlock',
          locked: !block.locked
        }
      }
    })
  }

  return (
    <Box sx={{ p: 4, pl: 6 }}>
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ [theme.breakpoints.down('sm')]: { display: 'none' }, mb: 4 }}
      >
        Conditions
      </Typography>
      <ToggleOption
        heading={'Lock the next step'}
        description={'Prevent skipping of current card'}
        checked={block.locked}
        handleChange={handleChange}
      >
        <Box display={'flex'} alignItems={'center'} color={'text.secondary'}>
          <InfoOutlinedIcon sx={{ mr: 4 }} />
          <Typography variant="caption">
            User can&apos;t skip interaction on the current card, like watching
            video or interacting with questions.
          </Typography>
        </Box>
      </ToggleOption>
    </Box>
  )
}

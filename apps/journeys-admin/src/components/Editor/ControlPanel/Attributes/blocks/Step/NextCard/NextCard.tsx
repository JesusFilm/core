import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useJourney } from '../../../../../../../libs/context'
import { StepBlockLockUpdate } from '../../../../../../../../__generated__/StepBlockLockUpdate'
import { ToggleOption } from '../../../ToggleOption'

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

interface NextCardProps {
  id: string
  nextBlockId: string | null
  locked: boolean
}

export function NextCard({
  id,
  nextBlockId,
  locked
}: NextCardProps): ReactElement {
  const [stepBlockLockUpdate] = useMutation<StepBlockLockUpdate>(
    STEP_BLOCK_LOCK_UPDATE
  )

  const journey = useJourney()

  async function handleChange(): Promise<void> {
    await stepBlockLockUpdate({
      variables: {
        id: id,
        journeyId: journey.id,
        input: {
          locked: !locked,
          nextBlockId: nextBlockId
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id,
          __typename: 'StepBlock',
          locked: !locked
        }
      }
    })
  }
  return (
    <>
      <Divider />
      <Box sx={{ px: 6, py: 4 }}>
        <Box>Cards</Box>
      </Box>
      <Divider />
      <Box sx={{ px: 6, py: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Conditions
        </Typography>
        <ToggleOption
          heading={'Conditions'}
          description={"Don't allow to skip the current card"}
          checked={locked}
          handleChange={handleChange}
        >
          <Box display={'flex'} alignItems={'center'} color={'text.secondary'}>
            <InfoOutlinedIcon sx={{ mr: 4 }} />
            <Typography variant="caption">
              User can&apos;t skip interaction on the current card, like
              watching video or interacting with questions.
            </Typography>
          </Box>
        </ToggleOption>
      </Box>
    </>
  )
}

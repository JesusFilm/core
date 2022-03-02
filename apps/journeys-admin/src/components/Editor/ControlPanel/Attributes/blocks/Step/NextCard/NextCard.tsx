import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { gql, useMutation } from '@apollo/client'
import { StepBlockLockUpdate } from '../../../../../../../../__generated__/StepBlockLockUpdate'

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

  async function handleChange(): Promise<void> {
    // TODO: update
    // if (selectedBlock != null && selectedBlock.__typename === 'StepBlock') {
    //   await stepBlockLockUpdate({
    //     variables: {
    //       id: selectedBlock.id,
    //       journeyId: journey.id,
    //       input: {
    //         locked: !checked,
    //         nextBlockId: selectedBlock.nextBlockId
    //       }
    //     },
    //     optimisticResponse: {
    //       stepBlockUpdate: {
    //         id: selectedBlock.id,
    //         __typename: 'StepBlock',
    //         locked: !checked
    //       }
    //     }
    //   })
    // }
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
      </Box>
    </>
  )
}

// Don&apos;t allow to skip the current card

{
  /* <InfoOutlinedIcon sx={{ mr: 4 }} />
<Typography variant="caption">
  User can&apos;t skip interaction on the current card, like watching
  video or interacting with questions.
</Typography> */
}

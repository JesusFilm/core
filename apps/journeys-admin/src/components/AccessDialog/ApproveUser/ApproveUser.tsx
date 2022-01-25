import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useMutation, gql } from '@apollo/client'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import { UserJourneyApprove } from '../../../../__generated__/UserJourneyApprove'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'

interface ApproveUserProps {
  id: string
}

export const USER_JOURNEY_APPROVE = gql`
  mutation UserJourneyApprove($id: ID!) {
    userJourneyApprove(id: $id) {
      id
      role
    }
  }
`

export function ApproveUser({ id }: ApproveUserProps): ReactElement {
  const [userJourneyApprove] =
    useMutation<UserJourneyApprove>(USER_JOURNEY_APPROVE)

  const handleApproveUser = async (): Promise<void> => {
    await userJourneyApprove({
      variables: { id },
      optimisticResponse: {
        userJourneyApprove: {
          id: id,
          role: UserJourneyRole.editor,
          __typename: 'UserJourney'
        }
      }
    })
  }

  return (
    <MenuItem onClick={handleApproveUser}>
      <BeenhereRoundedIcon sx={{ mr: 2 }} />
      Approve
    </MenuItem>
  )
}

import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useMutation, gql } from '@apollo/client'
import BeenhereRoundedIcon from '@mui/icons-material/BeenhereRounded'
import { GetJourney_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { UserJourneyApprove } from '../../../../__generated__/UserJourneyApprove'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'

interface ApproveUserProps {
  userJourney: UserJourney
}

export const USER_JOURNEY_APPROVE = gql`
  mutation UserJourneyApprove($userJourneyApproveId: ID!) {
    userJourneyApprove(id: $userJourneyApproveId) {
      id
      role
    }
  }
`

export const ApproveUser = ({
  userJourney
}: ApproveUserProps): ReactElement => {
  const [userJourneyApprove] =
    useMutation<UserJourneyApprove>(USER_JOURNEY_APPROVE)

  const handleApproveUser = async (): Promise<void> => {
    await userJourneyApprove({
      variables: { userJourneyApproveId: userJourney.id },
      optimisticResponse: {
        userJourneyApprove: {
          id: userJourney.id,
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

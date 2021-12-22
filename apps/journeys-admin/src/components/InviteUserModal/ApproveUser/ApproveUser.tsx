import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_userJourneys as UserJourneys } from '../../../../__generated__/GetJourney'
import { UserJourneyApprove } from '../../../../__generated__/UserJourneyApprove'
import { useMutation, gql } from '@apollo/client'
import { BeenhereRounded } from '@mui/icons-material'

interface ApproveUserProps {
  userJourneys: UserJourneys
}

export const USER_JOURNEY_APPROVE = gql`
  mutation UserJourneyApprove($userJourneyApproveId: ID!) {
    userJourneyApprove(id: $userJourneyApproveId) {
      id
    }
  }
`

export const ApproveUser = ({
  userJourneys
}: ApproveUserProps): ReactElement => {
  const [userJourneyApprove] =
    useMutation<UserJourneyApprove>(USER_JOURNEY_APPROVE)

  const handleApproveUser = async (): Promise<void> => {
    await userJourneyApprove({
      variables: { userJourneyApproveId: userJourneys.id },
      optimisticResponse: {
        userJourneyApprove: {
          id: userJourneys.id,
          __typename: 'UserJourney'
        }
      }
    })
  }

  return (
    <MenuItem onClick={handleApproveUser}>
      <BeenhereRounded sx={{ mr: 2 }} />
      Approve
    </MenuItem>
  )
}

import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_userJourneys as UserJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyUpdate } from '../../../../__generated__/UserJourneyUpdate'
import { BeenhereRounded } from '@mui/icons-material'

interface ApproveUserProps {
  userJourneys: UserJourneys
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
  userJourneys
}: ApproveUserProps): ReactElement => {
  const [userJourneyApprove] =
    useMutation<UserJourneyUpdate>(USER_JOURNEY_APPROVE)

  const handleApproveUser = async (
    id: string
  ): Promise<void> => {
    await userJourneyApprove({
      variables: {
        input: {
          id
        },
        optimisticResponse: {
          userJourneyApprove: {
            id
          }
        }
      }
    })
  }

  return (
    <MenuItem
      onClick={async () =>
        await handleApproveUser(userJourneys.id)
      }
    >
      {console.log(userJourneys.id)}
      <BeenhereRounded sx={{ mr: 2 }} />
      Approve
    </MenuItem >
  )
}

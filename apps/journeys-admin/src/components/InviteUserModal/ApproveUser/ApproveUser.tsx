import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyUpdate } from '../../../../__generated__/UserJourneyUpdate'

interface ApproveUserProps {
  usersJourneys: UsersJourneys
}

export const USER_JOURNEY_APPROVE = gql`
  mutation UserJourneyUpdate($input: UserJourneyUpdateInput!) {
    userJourneyUpdate(input: $input) {
      userId
      journeyId
    }
  }
`

export const ApproveUser = ({
  usersJourneys
}: ApproveUserProps): ReactElement => {
  const [userJourneyApprove] =
    useMutation<UserJourneyUpdate>(USER_JOURNEY_APPROVE)

  const handleApproveUser = (userId: string, journeyId: string): void => {
    void userJourneyApprove({
      variables: {
        input: {
          userId,
          journeyId
        },
        optimisticResponse: {
          userJourneyRemove: {
            userId,
            journeyId
          }
        }
      }
    })
  }

  return (
    <MenuItem
      onClick={() =>
        handleApproveUser(usersJourneys.userId, usersJourneys.journeyId)
      }
    >
      Approve
    </MenuItem>
  )
}

import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyUpdate } from '../../../../__generated__/UserJourneyUpdate'
import { BeenhereRounded } from '@mui/icons-material'

interface ApproveUserProps {
  usersJourneys: UsersJourneys
  handleClose: (event: React.MouseEvent<HTMLElement>) => void
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
  usersJourneys,
  handleClose
}: ApproveUserProps): ReactElement => {
  const [userJourneyApprove] =
    useMutation<UserJourneyUpdate>(USER_JOURNEY_APPROVE)

  const handleApproveUser = (
    userId: string,
    journeyId: string,
    e: React.MouseEvent<HTMLElement>
  ): void => {
    void userJourneyApprove({
      variables: {
        input: {
          userId,
          journeyId
        },
        optimisticResponse: {
          userJourneyApprove: {
            userId,
            journeyId
          }
        }
      }
    })
    void handleClose(e)
  }

  return (
    <MenuItem
      onClick={(e) =>
        handleApproveUser(usersJourneys.userId, usersJourneys.journeyId, e)
      }
    >
      <BeenhereRounded sx={{ mr: 2 }} />
      Approve
    </MenuItem>
  )
}

import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyRemove } from '../../../../__generated__/UserJourneyRemove'

interface RemoveUserProps {
  usersJourneys: UsersJourneys
}

export const USER_JOURNEY_REMOVE = gql`
  mutation UserJourneyRemove($input: UserJourneyRemoveInput!) {
    userJourneyRemove(input: $input) {
      userId
      journeyId
      role
    }
  }
`

export const RemoveUser = ({
  usersJourneys
}: RemoveUserProps): ReactElement => {
  const [userJourneyRemove] =
    useMutation<UserJourneyRemove>(USER_JOURNEY_REMOVE)

  const handleRemoveUser = (
    userId: string,
    journeyId: string,
    role: string
  ): void => {
    void userJourneyRemove({
      variables: {
        input: {
          userId,
          journeyId,
          role
        },
        optimisticResponse: {
          userJourneyRemove: {
            userId,
            journeyId,
            role
          }
        }
      }
    })
  }

  return (
    <MenuItem
      onClick={() =>
        handleRemoveUser(
          usersJourneys.userId,
          usersJourneys.journeyId,
          usersJourneys.role
        )
      }
    >
      Remove
    </MenuItem>
  )
}

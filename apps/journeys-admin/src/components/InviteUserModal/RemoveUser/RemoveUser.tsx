import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyRemove } from '../../../../__generated__/UserJourneyRemove'
import { RemoveCircleRounded } from '@mui/icons-material'
import { GET_USERS_JOURNEYS } from '../InviteUserModal'

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
  const [userJourneyRemove] = useMutation<UserJourneyRemove>(
    USER_JOURNEY_REMOVE,
    {
      refetchQueries: [GET_USERS_JOURNEYS, 'UserJourneyRemove']
    }
  )

  const handleRemoveUser = async (
    userId: string,
    journeyId: string,
    role: string
  ): Promise<void> => {
    await userJourneyRemove({
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
      onClick={async (e) =>
        await handleRemoveUser(
          usersJourneys.userId,
          usersJourneys.journeyId,
          usersJourneys.role
        )
      }
      sx={{ mr: 2 }}
    >
      <RemoveCircleRounded sx={{ mr: 2 }} />
      Remove
    </MenuItem>
  )
}

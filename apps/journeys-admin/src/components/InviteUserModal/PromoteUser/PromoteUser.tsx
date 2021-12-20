import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'
import { NewReleasesRounded } from '@mui/icons-material'
import { GET_USERS_JOURNEYS } from '../InviteUserModal'

interface PromoteUserProps {
  usersJourneys: UsersJourneys
}

export const USER_JOURNEY_PROMOTE = gql`
  mutation UserJourneyPromote($input: UserJourneyUpdateInput!) {
    userJourneyPromote(input: $input) {
      userId
      journeyId
    }
  }
`

export const PromoteUser = ({
  usersJourneys
}: PromoteUserProps): ReactElement => {
  const [userJourneyPromote] = useMutation<UserJourneyPromote>(
    USER_JOURNEY_PROMOTE,
    {
      refetchQueries: [GET_USERS_JOURNEYS, 'UserJourneyPromote']
    }
  )

  const handlePromoteUser = async (
    userId: string,
    journeyId: string
  ): Promise<void> => {
    await userJourneyPromote({
      variables: {
        input: {
          userId,
          journeyId
        },
        optimisticResponse: {
          userJourneyPromote: {
            userId,
            journeyId
          }
        }
      }
    })
  }

  return (
    <MenuItem
      onClick={async () =>
        await handlePromoteUser(usersJourneys.userId, usersJourneys.journeyId)
      }
    >
      <NewReleasesRounded sx={{ mr: 2 }} />
      Promote
    </MenuItem>
  )
}

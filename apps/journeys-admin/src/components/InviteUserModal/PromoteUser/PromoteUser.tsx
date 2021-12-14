import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'
import { NewReleasesRounded } from '@mui/icons-material'

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
  const [userJourneyPromote] =
    useMutation<UserJourneyPromote>(USER_JOURNEY_PROMOTE)

  const handlePromoteUser = (userId: string, journeyId: string): void => {
    void userJourneyPromote({
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
      onClick={() =>
        handlePromoteUser(usersJourneys.userId, usersJourneys.journeyId)
      }
    >
      <NewReleasesRounded sx={{ mr: 2 }} />
      Promote
    </MenuItem>
  )
}

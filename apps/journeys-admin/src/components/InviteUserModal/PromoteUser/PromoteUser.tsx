import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_userJourneys as UserJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'
import { NewReleasesRounded } from '@mui/icons-material'

interface PromoteUserProps {
  userJourneys: UserJourneys
}

export const USER_JOURNEY_PROMOTE = gql`
  mutation UserJourneyPromote($userJourneyPromoteId: ID!) {
    userJourneyPromote(id: $userJourneyPromoteId) {
      id
      role
      journey {
        id
      }
    }
  }
`

export const PromoteUser = ({
  userJourneys
}: PromoteUserProps): ReactElement => {
  const [userJourneyPromote] =
    useMutation<UserJourneyPromote>(USER_JOURNEY_PROMOTE)

  const handlePromoteUser = async (
  ): Promise<void> => {
    await userJourneyPromote({
      variables: { id: userJourneys.id },
      optimisticResponse: {
        userJourneyPromote: {
          id: userJourneys.id,
          role: userJourneys.role,
          journey: {
            id: userJourneys.journeyId,
            __typename: 'Journey',
          },
          __typename: 'UserJourney'
        }
      }
    })
  }

  return (
    <MenuItem onClick={handlePromoteUser}>
      <NewReleasesRounded sx={{ mr: 2 }} />
      Promote
    </MenuItem>
  )
}

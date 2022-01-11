import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'
import { NewReleasesRounded } from '@mui/icons-material'

interface PromoteUserProps {
  userJourney: UserJourney
}

export const USER_JOURNEY_PROMOTE = gql`
  mutation UserJourneyPromote($userJourneyPromoteId: ID!) {
    userJourneyPromote(id: $userJourneyPromoteId) {
      id
      role
      journey {
        id
        userJourneys {
          id
          role
        }
      }
    }
  }
`

export function PromoteUser({ userJourney }: PromoteUserProps): ReactElement {
  const [userJourneyPromote] =
    useMutation<UserJourneyPromote>(USER_JOURNEY_PROMOTE)

  const handlePromoteUser = async (): Promise<void> => {
    await userJourneyPromote({
      variables: { userJourneyPromoteId: userJourney.id }
    })
  }

  return (
    <MenuItem onClick={handlePromoteUser}>
      <NewReleasesRounded sx={{ mr: 2 }} />
      Promote
    </MenuItem>
  )
}

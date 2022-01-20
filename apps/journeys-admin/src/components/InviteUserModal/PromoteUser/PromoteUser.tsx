import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useMutation, gql } from '@apollo/client'
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded'
import { GetJourney_adminJourney_userJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'

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
      <NewReleasesRoundedIcon sx={{ mr: 2 }} />
      Promote
    </MenuItem>
  )
}

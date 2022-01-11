import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { GetJourney_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded'

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

export const PromoteUser = ({
  userJourney
}: PromoteUserProps): ReactElement => {
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

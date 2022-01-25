import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useMutation, gql } from '@apollo/client'
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'

interface PromoteUserProps {
  id: string
}

export const USER_JOURNEY_PROMOTE = gql`
  mutation UserJourneyPromote($id: ID!) {
    userJourneyPromote(id: $id) {
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

export function PromoteUser({ id }: PromoteUserProps): ReactElement {
  const [userJourneyPromote] =
    useMutation<UserJourneyPromote>(USER_JOURNEY_PROMOTE)

  const handlePromoteUser = async (): Promise<void> => {
    await userJourneyPromote({
      variables: { id }
    })
  }

  return (
    <MenuItem onClick={handlePromoteUser}>
      <NewReleasesRoundedIcon sx={{ mr: 2 }} />
      Promote
    </MenuItem>
  )
}

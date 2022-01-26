import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import NewReleasesRoundedIcon from '@mui/icons-material/NewReleasesRounded'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
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

  const handleClick = async (): Promise<void> => {
    await userJourneyPromote({
      variables: { id }
    })
  }

  return (
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
        <NewReleasesRoundedIcon />
      </ListItemIcon>
      <ListItemText>Promote</ListItemText>
    </MenuItem>
  )
}

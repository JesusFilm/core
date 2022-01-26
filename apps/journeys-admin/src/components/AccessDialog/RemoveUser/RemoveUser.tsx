import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import { UserJourneyRemove } from '../../../../__generated__/UserJourneyRemove'

interface RemoveUserProps {
  id: string
}

export const USER_JOURNEY_REMOVE = gql`
  mutation UserJourneyRemove($id: ID!) {
    userJourneyRemove(id: $id) {
      id
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

export function RemoveUser({ id }: RemoveUserProps): ReactElement {
  const [userJourneyRemove] =
    useMutation<UserJourneyRemove>(USER_JOURNEY_REMOVE)

  const handleClick = async (): Promise<void> => {
    await userJourneyRemove({
      variables: { id }
    })
  }

  return (
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
        <RemoveCircleRoundedIcon />
      </ListItemIcon>
      <ListItemText>Remove</ListItemText>
    </MenuItem>
  )
}

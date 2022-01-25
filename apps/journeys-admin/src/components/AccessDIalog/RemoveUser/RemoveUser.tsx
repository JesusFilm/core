import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useMutation, gql } from '@apollo/client'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
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

  const handleRemoveUser = async (): Promise<void> => {
    await userJourneyRemove({
      variables: { id }
    })
  }

  return (
    <MenuItem onClick={handleRemoveUser}>
      <RemoveCircleRoundedIcon sx={{ mr: 2 }} />
      Remove
    </MenuItem>
  )
}

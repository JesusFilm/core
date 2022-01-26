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
      }
    }
  }
`

export function RemoveUser({ id }: RemoveUserProps): ReactElement {
  const [userJourneyRemove] = useMutation<UserJourneyRemove>(
    USER_JOURNEY_REMOVE,
    {
      variables: { id },
      update(cache, { data }) {
        if (data?.userJourneyRemove.journey != null)
          cache.modify({
            id: cache.identify({ ...data.userJourneyRemove.journey }),
            fields: {
              userJourneys(refs, { readField }) {
                return refs.filter((ref) => id !== readField('id', ref))
              }
            }
          })
      }
    }
  )

  const handleClick = async (): Promise<void> => {
    await userJourneyRemove()
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

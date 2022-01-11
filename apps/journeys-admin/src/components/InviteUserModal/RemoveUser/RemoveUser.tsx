import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import { useMutation, gql } from '@apollo/client'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import { GetJourney_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { UserJourneyRemove } from '../../../../__generated__/UserJourneyRemove'

interface RemoveUserProps {
  userJourney: UserJourney
}

export const USER_JOURNEY_REMOVE = gql`
  mutation UserJourneyRemove($userJourneyRemoveId: ID!) {
    userJourneyRemove(id: $userJourneyRemoveId) {
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

export function RemoveUser({ userJourney }: RemoveUserProps): ReactElement {
  const [userJourneyRemove] =
    useMutation<UserJourneyRemove>(USER_JOURNEY_REMOVE)

  const handleRemoveUser = async (id: string): Promise<void> => {
    await userJourneyRemove({
      variables: { userJourneyRemoveId: id }
    })
  }

  return (
    <MenuItem
      onClick={async () => await handleRemoveUser(userJourney.id)}
      sx={{ mr: 2 }}
    >
      <RemoveCircleRoundedIcon sx={{ mr: 2 }} />
      Remove
    </MenuItem>
  )
}

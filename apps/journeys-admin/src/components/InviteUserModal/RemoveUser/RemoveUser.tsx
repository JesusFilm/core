import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_userJourneys as UserJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyRemove } from '../../../../__generated__/UserJourneyRemove'
import { RemoveCircleRounded } from '@mui/icons-material'

interface RemoveUserProps {
  userJourneys: UserJourneys
}

export const USER_JOURNEY_REMOVE = gql`
  mutation UserJourneyRemove($userJourneyRemoveId: ID!) {
    userJourneyRemove(id: $userJourneyRemoveId) {
      id
      journey {
        id
      }
    }
  }
`

export const RemoveUser = ({ userJourneys }: RemoveUserProps): ReactElement => {
  const [userJourneyRemove] =
    useMutation<UserJourneyRemove>(USER_JOURNEY_REMOVE)

  const handleRemoveUser = async (): Promise<void> => {
    await userJourneyRemove({
      variables: { userJourneyRemoveId: userJourneys.id },
      optimisticResponse: {
        userJourneyRemove: {
          id: userJourneys.id,
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
    <MenuItem
      onClick={handleRemoveUser}
      sx={{ mr: 2 }}
    >
      <RemoveCircleRounded sx={{ mr: 2 }} />
      Remove
    </MenuItem>
  )
}

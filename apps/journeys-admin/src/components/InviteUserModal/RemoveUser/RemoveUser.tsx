import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyRemove } from '../../../../__generated__/UserJourneyRemove'
import { RemoveCircleRounded } from '@mui/icons-material'

interface RemoveUserProps {
  usersJourneys: UsersJourneys
  handleClose: (event: React.MouseEvent<HTMLElement>) => void
}

export const USER_JOURNEY_REMOVE = gql`
  mutation UserJourneyRemove($input: UserJourneyRemoveInput!) {
    userJourneyRemove(input: $input) {
      userId
      journeyId
      role
    }
  }
`

export const RemoveUser = ({
  usersJourneys,
  handleClose
}: RemoveUserProps): ReactElement => {
  const [userJourneyRemove] =
    useMutation<UserJourneyRemove>(USER_JOURNEY_REMOVE)

  const handleRemoveUser = (
    userId: string,
    journeyId: string,
    role: string,
    e: React.MouseEvent<HTMLElement>
  ): void => {
    void userJourneyRemove({
      variables: {
        input: {
          userId,
          journeyId,
          role
        },
        optimisticResponse: {
          userJourneyRemove: {
            userId,
            journeyId,
            role
          }
        }
      }
    })
    void handleClose(e)
  }

  return (
    <MenuItem
      onClick={(e) =>
        handleRemoveUser(
          usersJourneys.userId,
          usersJourneys.journeyId,
          usersJourneys.role,
          e
        )
      }
      sx={{ mr: 2 }}
    >
      <RemoveCircleRounded sx={{ mr: 2 }} />
      Remove
    </MenuItem>
  )
}

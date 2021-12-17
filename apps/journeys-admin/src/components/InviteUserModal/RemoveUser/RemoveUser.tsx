import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyRemove } from '../../../../__generated__/UserJourneyRemove'
import { RemoveCircleRounded } from '@mui/icons-material'

interface RemoveUserProps {
  usersJourneys: UsersJourneys
  handleClose: (result) => void
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

  const handleRemoveUser = async (
    userId: string,
    journeyId: string,
    role: string
  ): Promise<void> => {
    const result = await userJourneyRemove({
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
    void handleClose(result)
  }

  return (
    <MenuItem
      onClick={async (e) =>
        await handleRemoveUser(
          usersJourneys.userId,
          usersJourneys.journeyId,
          usersJourneys.role
        )
      }
      sx={{ mr: 2 }}
    >
      <RemoveCircleRounded sx={{ mr: 2 }} />
      Remove
    </MenuItem>
  )
}

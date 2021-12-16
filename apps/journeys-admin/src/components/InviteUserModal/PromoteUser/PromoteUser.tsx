import { ReactElement } from 'react'
import { MenuItem } from '@mui/material'
import { GetJourney_journey_usersJourneys as UsersJourneys } from '../../../../__generated__/GetJourney'
import { useMutation, gql } from '@apollo/client'
import { UserJourneyPromote } from '../../../../__generated__/UserJourneyPromote'
import { NewReleasesRounded } from '@mui/icons-material'

interface PromoteUserProps {
  usersJourneys: UsersJourneys
  handleClose: (event: React.MouseEvent<HTMLElement>) => void
}

export const USER_JOURNEY_PROMOTE = gql`
  mutation UserJourneyPromote($input: UserJourneyUpdateInput!) {
    userJourneyPromote(input: $input) {
      userId
      journeyId
    }
  }
`

export const PromoteUser = ({
  usersJourneys,
  handleClose
}: PromoteUserProps): ReactElement => {
  const [userJourneyPromote] =
    useMutation<UserJourneyPromote>(USER_JOURNEY_PROMOTE)

  const handlePromoteUser = (
    userId: string,
    journeyId: string,
    e: React.MouseEvent<HTMLElement>
  ): void => {
    void userJourneyPromote({
      variables: {
        input: {
          userId,
          journeyId
        },
        optimisticResponse: {
          userJourneyPromote: {
            userId,
            journeyId
          }
        }
      }
    })
    void handleClose(e)
  }

  return (
    <MenuItem
      onClick={(e) =>
        handlePromoteUser(usersJourneys.userId, usersJourneys.journeyId, e)
      }
    >
      <NewReleasesRounded sx={{ mr: 2 }} />
      Promote
    </MenuItem>
  )
}

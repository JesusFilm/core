import { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'

export const USER_JOURNEY_OPEN = gql`
  mutation UserJourneyOpen($id: ID!) {
    userJourneyOpen(id: $id) {
      id
    }
  }
`

export function useUserJourneyOpen(journeyId?: string | null): void {
  const [userJourneyOpen] = useMutation<UserJourneyOpen>(USER_JOURNEY_OPEN)

  useEffect(() => {
    if (journeyId != null) {
      void userJourneyOpen({ variables: { id: journeyId } })
    }
  }, [journeyId, userJourneyOpen])
}

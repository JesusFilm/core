import { useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { UserJourneyOpen } from '../../../__generated__/UserJourneyOpen'
import { GetJourney_journey_userJourneys as UserJourney } from '../../../__generated__/GetJourney'

export const USER_JOURNEY_OPEN = gql`
  mutation UserJourneyOpen($id: ID!) {
    userJourneyOpen(id: $id) {
      id
    }
  }
`

export function useUserJourneyOpen(
  userId?: string | null,
  journeyId?: string | null,
  userJourneys?: UserJourney[] | null
): void {
  const [userJourneyOpen] = useMutation<UserJourneyOpen>(USER_JOURNEY_OPEN)

  useEffect(() => {
    if (userJourneys == null || journeyId == null || userId == null) return
    const user = userJourneys.find((uj) => uj?.user?.id === userId)
    if (user == null || user.openedAt != null) return

    void userJourneyOpen({ variables: { id: journeyId } })
  }, [journeyId, userJourneys, userId, userJourneyOpen])
}

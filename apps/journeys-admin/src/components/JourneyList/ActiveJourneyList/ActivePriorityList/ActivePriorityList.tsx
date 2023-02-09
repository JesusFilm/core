import { ApolloQueryResult, OperationVariables } from '@apollo/client'
import { ReactElement } from 'react'
import { AuthUser } from 'next-firebase-auth'
import {
  GetActiveJourneys,
  GetActiveJourneys_journeys as Journey
} from '../../../../../__generated__/GetActiveJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { JourneyCard } from '../../JourneyCard'
import { SortOrder } from '../../JourneySort'
import { sortJourneys } from '../../JourneySort/utils/sortJourneys'

interface Props {
  journeys: Journey[]
  sortJourneys: typeof sortJourneys
  sortOrder?: SortOrder
  refetch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<GetActiveJourneys>>
  duplicatedJourneyId?: string
  authUser?: AuthUser
}

export function ActivePriorityList({
  journeys,
  sortJourneys,
  sortOrder,
  refetch,
  duplicatedJourneyId,
  authUser
}: Props): ReactElement {
  const newJourneys: Journey[] = []
  const actionRequiredJourneys: Journey[] = []
  const activeJourneys: Journey[] = []

  journeys.forEach((journey) => {
    const currentUserJourney = journey.userJourneys?.find(
      (uj) => uj.user?.id === authUser?.id
    )

    if (currentUserJourney != null && currentUserJourney.openedAt == null) {
      newJourneys.push(journey)
    } else if (
      (currentUserJourney?.role === UserJourneyRole.owner ||
        currentUserJourney?.role === UserJourneyRole.editor) &&
      journey.userJourneys?.find(
        (uj) => uj.role === UserJourneyRole.inviteRequested
      ) != null
    ) {
      actionRequiredJourneys.push(journey)
    } else {
      activeJourneys.push(journey)
    }
  })

  const sortedJourneys = sortJourneys(activeJourneys, sortOrder)

  return (
    <>
      {actionRequiredJourneys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          refetch={refetch}
          duplicatedJourneyId={duplicatedJourneyId}
        />
      ))}
      {newJourneys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          refetch={refetch}
          duplicatedJourneyId={duplicatedJourneyId}
        />
      ))}
      {sortedJourneys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          refetch={refetch}
          duplicatedJourneyId={duplicatedJourneyId}
        />
      ))}
    </>
  )
}

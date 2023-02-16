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
import { JourneyCardVariant } from '../../JourneyCard/journeyCardVariant'

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

    if (
      currentUserJourney?.role === UserJourneyRole.owner &&
      journey.userJourneys?.find(
        (uj) => uj.role === UserJourneyRole.inviteRequested
      ) != null
    ) {
      actionRequiredJourneys.push(journey)
    } else if (
      currentUserJourney != null &&
      currentUserJourney.openedAt == null
    ) {
      newJourneys.push(journey)
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
          variant={JourneyCardVariant.actionRequired}
        />
      ))}
      {newJourneys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          refetch={refetch}
          duplicatedJourneyId={duplicatedJourneyId}
          variant={JourneyCardVariant.new}
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

import { ApolloQueryResult, OperationVariables } from '@apollo/client'
import Box from '@mui/material/Box'
import { User } from 'next-firebase-auth'
import { ReactElement, useMemo } from 'react'

import {
  GetJourneysAdmin,
  GetJourneysAdmin_journeys as Journey
} from '../../../../../__generated__/GetJourneysAdmin'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { JourneyCard } from '../../JourneyCard'
import { JourneyCardVariant } from '../../JourneyCard/journeyCardVariant'
import { SortOrder } from '../../JourneySort'
import { sortJourneys } from '../../JourneySort/utils/sortJourneys'

interface Props {
  journeys: Journey[]
  sortOrder?: SortOrder
  refetch?: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<GetJourneysAdmin>>
  user?: User
}

export function ActivePriorityList({
  journeys,
  sortOrder,
  refetch,
  user
}: Props): ReactElement {
  const { newJourneys, actionRequiredJourneys, activeJourneys } =
    useMemo(() => {
      const newJourneys: Journey[] = []
      const actionRequiredJourneys: Journey[] = []
      const activeJourneys: Journey[] = []

      journeys.forEach((journey) => {
        const currentUserJourney = journey.userJourneys?.find(
          (uj) => uj.user?.id === user?.id
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

      return { newJourneys, actionRequiredJourneys, activeJourneys }
    }, [journeys, user])

  const sortedActionRequiredJourneys = useMemo(() => {
    return sortJourneys(actionRequiredJourneys, sortOrder)
  }, [actionRequiredJourneys, sortOrder])

  const sortedNewJourneys = useMemo(() => {
    return sortJourneys(newJourneys, sortOrder)
  }, [newJourneys, sortOrder])

  const sortedJourneys = useMemo(() => {
    return sortJourneys(activeJourneys, sortOrder)
  }, [activeJourneys, sortOrder])

  return (
    <>
      {sortedActionRequiredJourneys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          refetch={refetch}
          variant={JourneyCardVariant.actionRequired}
        />
      ))}
      {sortedNewJourneys.map((journey) => (
        <JourneyCard
          key={journey.id}
          journey={journey}
          refetch={refetch}
          variant={JourneyCardVariant.new}
        />
      ))}
      {(sortedActionRequiredJourneys.length > 0 ||
        sortedNewJourneys.length > 0) &&
        sortedJourneys.length > 0 && (
          <Box
            aria-label="big-divider"
            sx={{
              height: 8,
              width: '100%',
              borderTop: '1px solid',
              borderLeft: '1px solid',
              borderRight: '1px solid',
              borderColor: 'divider'
            }}
          />
        )}
      {sortedJourneys.map((journey) => (
        <JourneyCard key={journey.id} journey={journey} refetch={refetch} />
      ))}
    </>
  )
}

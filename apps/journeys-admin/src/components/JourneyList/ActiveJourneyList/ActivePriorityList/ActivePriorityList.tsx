import { ApolloQueryResult, OperationVariables } from '@apollo/client'
import { ReactElement, useMemo } from 'react'
import { AuthUser } from 'next-firebase-auth'
import Box from '@mui/material/Box'
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
  sortOrder?: SortOrder
  refetch: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<GetActiveJourneys>>
  duplicatedJourneyId?: string
  authUser?: AuthUser
}

export function ActivePriorityList({
  journeys,
  sortOrder,
  refetch,
  duplicatedJourneyId,
  authUser
}: Props): ReactElement {
  const { newJourneys, actionRequiredJourneys, activeJourneys } =
    useMemo(() => {
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

      return { newJourneys, actionRequiredJourneys, activeJourneys }
    }, [journeys, authUser])

  const sortedJourneys = useMemo(() => {
    return sortJourneys(activeJourneys, sortOrder)
  }, [activeJourneys, sortOrder])

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
      {(actionRequiredJourneys.length > 0 || newJourneys.length > 0) && (
        <Box
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

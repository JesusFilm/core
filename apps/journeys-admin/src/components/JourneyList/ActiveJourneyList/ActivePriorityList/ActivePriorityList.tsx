import { ApolloQueryResult, OperationVariables } from '@apollo/client'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import { User } from 'next-firebase-auth'
import { ReactElement, useMemo } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { JourneyFields } from '../../../../../__generated__/JourneyFields'
import { JourneyCard } from '../../JourneyCard'
import { JourneyCardVariant } from '../../JourneyCard/journeyCardVariant'
import { SortOrder } from '../../JourneySort'
import { sortJourneys } from '../../JourneySort/utils/sortJourneys'

interface ActivePriorityListProps {
  journeys: Journey[]
  sortOrder?: SortOrder
  refetch?: (
    variables?: Partial<OperationVariables> | undefined
  ) => Promise<ApolloQueryResult<GetAdminJourneys>>
  user?: User
}

export function ActivePriorityList({
  journeys,
  sortOrder,
  refetch,
  user
}: ActivePriorityListProps): ReactElement {
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

  const allActiveJourneys = useMemo(
    () => ({
      [JourneyCardVariant.actionRequired]: sortedActionRequiredJourneys,
      [JourneyCardVariant.new]: sortedNewJourneys,
      [JourneyCardVariant.default]: sortedJourneys
    }),
    [sortedActionRequiredJourneys, sortedNewJourneys, sortedJourneys]
  )

  return (
    <Box sx={{ mt: 5 }}>
      <Grid container spacing={5} rowSpacing={5}>
        {Object.entries(allActiveJourneys).map(([key, journeys]) =>
          journeys.map((journey) => (
            <Grid key={journey.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <JourneyProvider
                value={{
                  journey: journey as unknown as JourneyFields,
                  variant: 'admin'
                }}
              >
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  refetch={refetch}
                  variant={key as JourneyCardVariant}
                />
              </JourneyProvider>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  )
}

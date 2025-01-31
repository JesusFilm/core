import { gql, useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { formatISO } from 'date-fns'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useEffect } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import {
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
} from '../../../../../../__generated__/GetJourneyPlausibleVisitors'
import { earliestStatsCollected } from '../../../EditorManager/JourneyFlow/AnalyticsOverlaySwitch'
import { Item } from '../Item/Item'

interface AnalyticsItemProps {
  variant: ComponentProps<typeof Item>['variant']
}

export const GET_JOURNEY_PLAUSIBLE_VISITORS = gql`
  query GetJourneyPlausibleVisitors($id: ID!, $date: String) {
    journeyAggregateVisitors: journeysPlausibleStatsAggregate(
      id: $id
      idType: databaseId
      where: { period: "custom", date: $date }
    ) {
      visitors {
        value
      }
    }
  }
`

export function AnalyticsItem({ variant }: AnalyticsItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const [loadPlausibleVisitors, { data }] = useLazyQuery<
    GetJourneyPlausibleVisitors,
    GetJourneyPlausibleVisitorsVariables
  >(GET_JOURNEY_PLAUSIBLE_VISITORS)
  useEffect(() => {
    if (journey?.id != null)
      void loadPlausibleVisitors({
        variables: {
          date: `${earliestStatsCollected},${formatISO(new Date(), {
            representation: 'date'
          })}`,
          id: journey.id
        }
      })
  }, [journey?.id, loadPlausibleVisitors])

  return (
    <Box data-testid="AnalyticsItem">
      <NextLink
        href={`/journeys/${journey?.id}/reports`}
        passHref
        legacyBehavior
        prefetch={false}
      >
        <Item
          variant={variant}
          label={t('Analytics')}
          icon={<BarChartSquare3Icon />}
          count={data?.journeyAggregateVisitors?.visitors?.value ?? 0}
          countLabel={t('{{count}} visitors', {
            count: data?.journeyAggregateVisitors?.visitors?.value ?? 0
          })}
        />
      </NextLink>
    </Box>
  )
}

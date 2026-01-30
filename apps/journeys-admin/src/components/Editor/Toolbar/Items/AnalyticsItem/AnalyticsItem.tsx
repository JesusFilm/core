import { gql, useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { formatISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useEffect } from 'react'

import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import {
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
} from '../../../../../../__generated__/GetJourneyPlausibleVisitors'
import { earliestStatsCollected } from '../../../Slider/JourneyFlow/AnalyticsOverlaySwitch'
import { Item } from '../Item/Item'

interface AnalyticsItemProps {
  variant: ComponentProps<typeof Item>['variant']
  fromJourneyList?: boolean
  journeyId?: string
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

export function AnalyticsItem({
  variant,
  fromJourneyList = false,
  journeyId
}: AnalyticsItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [loadPlausibleVisitors, { data }] = useLazyQuery<
    GetJourneyPlausibleVisitors,
    GetJourneyPlausibleVisitorsVariables
  >(GET_JOURNEY_PLAUSIBLE_VISITORS)
  useEffect(() => {
    if (journeyId != null)
      void loadPlausibleVisitors({
        variables: {
          date: `${earliestStatsCollected},${formatISO(new Date(), {
            representation: 'date'
          })}`,
          id: journeyId
        }
      })
  }, [journeyId, loadPlausibleVisitors])

  const linkHref = fromJourneyList
    ? `/journeys/${journeyId}/reports?from=journey-list`
    : `/journeys/${journeyId}/reports`

  const buttonProps = fromJourneyList
    ? {
        sx: {
          minWidth: 30,
          '& > .MuiButton-startIcon > .MuiSvgIcon-root': {
            fontSize: '20px'
          }
        }
      }
    : {}

  return (
    <Box data-testid="AnalyticsItem">
      <Item
        href={linkHref}
        variant={variant}
        label={t('Analytics')}
        icon={<BarChartSquare3Icon />}
        count={data?.journeyAggregateVisitors?.visitors?.value ?? 0}
        countLabel={t('{{count}} visitors', {
          count: data?.journeyAggregateVisitors?.visitors?.value ?? 0
        })}
        ButtonProps={buttonProps}
      />
    </Box>
  )
}

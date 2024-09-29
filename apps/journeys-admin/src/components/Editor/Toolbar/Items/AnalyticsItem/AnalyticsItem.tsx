import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatISO } from 'date-fns'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import {
  GetJourneyPlausibleVisitors,
  GetJourneyPlausibleVisitorsVariables
} from '../../../../../../__generated__/GetJourneyPlausibleVisitors'
import { earliestStatsCollected } from '../../../Slider/JourneyFlow/AnalyticsOverlaySwitch'
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
  const currentDate = formatISO(new Date(), { representation: 'date' })

  const { data } = useQuery<
    GetJourneyPlausibleVisitors,
    GetJourneyPlausibleVisitorsVariables
  >(GET_JOURNEY_PLAUSIBLE_VISITORS, {
    variables: {
      date: `${earliestStatsCollected},${currentDate}`,
      id: journey?.id ?? ''
    }
  })

  return (
    <Stack
      data-testid="AnalyticsItem"
      direction="row"
      gap={1}
      alignItems="center"
    >
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
        />
      </NextLink>
      <Typography variant="body2">
        {data?.journeyAggregateVisitors?.visitors?.value ?? ''}
      </Typography>
    </Stack>
  )
}

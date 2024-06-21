import { JourneyStatsBreakdown } from '@core/journeys/ui/transformPlausibleBreakdown/transformPlausibleBreakdown'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { JourneyAnalyticsCardStat } from './JourneyAnalyticsCardStat'

type JourneyAnalyticsProps = {
  totalVisitors?: number
  chatsStarted?: number
  linksVisited?: number
}

export function JourneyAnalyticsCard({
  totalVisitors,
  chatsStarted,
  linksVisited
}: JourneyAnalyticsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack direction="row" sx={{ mt: 8 }}>
      <JourneyAnalyticsCardStat label={t('Visitors')} count={totalVisitors} />
      <Divider orientation="vertical" flexItem />
      <JourneyAnalyticsCardStat
        label={t('Chats Started')}
        count={chatsStarted}
      />
      <Divider orientation="vertical" flexItem />
      <JourneyAnalyticsCardStat
        label={t('Sites Visited')}
        count={linksVisited}
      />
    </Stack>
  )
}

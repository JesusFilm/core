import { useEditor } from '@core/journeys/ui/EditorProvider'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { JourneyAnalyticsCardStat } from './JourneyAnalyticsCardStat'

export function JourneyAnalyticsCard(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { analytics }
  } = useEditor()

  return (
    <Stack direction="row" sx={{ mt: 8 }}>
      <JourneyAnalyticsCardStat
        label={t('Visitors')}
        count={analytics?.totalVisitors}
      />
      <Divider orientation="vertical" flexItem />
      <JourneyAnalyticsCardStat
        label={t('Chats Started')}
        count={analytics?.chatsStarted}
      />
      <Divider orientation="vertical" flexItem />
      <JourneyAnalyticsCardStat
        label={t('Sites Visited')}
        count={analytics?.linksVisited}
      />
    </Stack>
  )
}

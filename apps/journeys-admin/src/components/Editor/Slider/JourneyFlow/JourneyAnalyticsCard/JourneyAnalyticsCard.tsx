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
    <Stack
      direction="row"
      sx={{ mt: 6 }}
      divider={
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: 'secondary.dark', opacity: 0.1 }}
        />
      }
    >
      <JourneyAnalyticsCardStat
        label={t('Visitors')}
        count={analytics?.totalVisitors}
      />
      <JourneyAnalyticsCardStat
        label={t('Chats Started')}
        count={analytics?.chatsStarted}
      />
      <JourneyAnalyticsCardStat
        label={t('Sites Visited')}
        count={analytics?.linksVisited}
      />
    </Stack>
  )
}

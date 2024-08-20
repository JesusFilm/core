import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

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
        label={t('Chats')}
        count={analytics?.chatsStarted}
      />
      <JourneyAnalyticsCardStat
        label={t('Site Visits')}
        count={analytics?.linksVisited}
      />
    </Stack>
  )
}

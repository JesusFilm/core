import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

export function AnalyticsOverlaySwitch(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { showJourneyFlowAnalytics },
    dispatch
  } = useEditor()

  function handleSwitchAnalytics(): void {
    dispatch({
      type: 'SetShowJourneyFlowAnalyticsAction',
      showJourneyFlowAnalytics: !showJourneyFlowAnalytics
    })
  }

  return (
    <Stack>
      <FormControlLabel
        control={
          <Switch
            checked={showJourneyFlowAnalytics}
            onChange={handleSwitchAnalytics}
          />
        }
        label={
          <Typography variant="subtitle2">{t('Analytics Overlay')}</Typography>
        }
        labelPlacement="start"
      />
    </Stack>
  )
}

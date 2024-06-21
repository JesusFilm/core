import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
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
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={showJourneyFlowAnalytics}
            onChange={handleSwitchAnalytics}
          />
        }
        label={t('Analytics')}
        labelPlacement="start"
      />
    </Box>
  )
}

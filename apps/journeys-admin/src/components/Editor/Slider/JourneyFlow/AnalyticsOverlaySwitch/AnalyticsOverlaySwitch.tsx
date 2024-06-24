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
    state: { showAnalytics },
    dispatch
  } = useEditor()

  function handleSwitchAnalytics(): void {
    dispatch({
      type: 'SetshowAnalyticsAction',
      showAnalytics: showAnalytics !== true
    })
  }

  return (
    <Stack>
      <FormControlLabel
        control={
          <Switch
            checked={showAnalytics === true}
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

import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { tabA11yProps } from '@core/shared/ui/TabPanel'

interface JourneyQuickSettingsTabsProps {
  tabValue: number
  setTabValue: (newValue: number) => void
}

export function JourneyQuickSettingsTabs({
  tabValue,
  setTabValue
}: JourneyQuickSettingsTabsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  function handleTabChange(_event, newValue: number): void {
    setTabValue(newValue)
  }

  return (
    <Stack data-testid="JourneyQuickSettingsTabs">
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('Chat')} {...tabA11yProps('host-tab', 0)} />
        <Tab label={t('Goals')} {...tabA11yProps('goals-tab', 1)} />
      </Tabs>
    </Stack>
  )
}

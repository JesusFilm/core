import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { tabA11yProps } from '@core/shared/ui/TabPanel'

export function SignInTabs(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [tabValue, setTabValue] = useState(0)

  function handleTabChange(_: unknown, newValue: number): void {
    setTabValue(newValue)
  }

  return (
    <Tabs
      value={tabValue}
      onChange={handleTabChange}
      variant="fullWidth"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab label={t('New account')} {...tabA11yProps('new-account-tab', 0)} />
      <Tab label={t('Log In')} {...tabA11yProps('log-in-tab', 1)} />
    </Tabs>
  )
}

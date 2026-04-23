import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { tabA11yProps } from '@core/shared/ui/TabPanel'

export function SignInTabs(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [tabValue, setTabValue] = useState(0)

  return (
    <Tabs
      value={tabValue}
      onChange={(_, newValue) => {
        setTabValue(newValue)
      }}
      variant="fullWidth"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Tab label={t('New account')} {...tabA11yProps('new-account-tab', 0)} />
      <Tab label={t('Log In')} {...tabA11yProps('log-in-tab', 1)} />
    </Tabs>
  )
}

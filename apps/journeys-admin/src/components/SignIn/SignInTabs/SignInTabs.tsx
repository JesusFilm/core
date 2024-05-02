import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { tabA11yProps } from '@core/shared/ui/TabPanel'

export function SignInTabs(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    setTabValue(router.query.login === 'true' ? 1 : 0)
  }, [router])

  function handleTabChange(_event, newValue: number): void {
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

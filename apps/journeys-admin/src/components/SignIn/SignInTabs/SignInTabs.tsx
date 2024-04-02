import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import { tabA11yProps } from '@core/shared/ui/TabPanel'

export function SignInTabs(): ReactElement {
  const router = useRouter()
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    setTabValue(router.query.action === 'login' ? 1 : 0)
  }, [router])

  function handleTabChange(_event, newValue): void {
    setTabValue(newValue)
  }

  return (
    <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
      <Tab label="New account" {...tabA11yProps('new-account-tab', 0)} />
      <Tab label="Log In" {...tabA11yProps('log-in-tab', 1)} />
    </Tabs>
  )
}

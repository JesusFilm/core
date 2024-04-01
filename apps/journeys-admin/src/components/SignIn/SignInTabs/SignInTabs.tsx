import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactElement, useState } from 'react'

import { tabA11yProps } from '@core/shared/ui/TabPanel'

export function SignInTabs(): ReactElement {
  const [tabValue, setTabValue] = useState(0)

  function handleTabChange(_event, newValue): void {
    setTabValue(newValue)
  }

  return (
    <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
      <Tab
        label="Create an account"
        {...tabA11yProps('create-account-tab', 0)}
      />
      <Tab label="Log In" {...tabA11yProps('log-in-tab', 1)} />
    </Tabs>
  )
}

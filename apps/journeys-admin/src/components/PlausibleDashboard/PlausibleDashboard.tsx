import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import { ReactElement, ReactNode, SyntheticEvent, useState } from 'react'

import { PlausibleChart } from '../PlausibleChart'
import { PlausibleFilter } from '../PlausibleFilter'
import { PlausibleLocalProvider } from '../PlausibleLocalProvider'
import { PlausibleTopCards } from '../PlausibleTopCards'

interface PlausibleDashboardProps {
  children?: ReactNode
}

export function PlausibleDashboard({
  children
}: PlausibleDashboardProps): ReactElement {
  const [value, setValue] = useState('1')

  function handleChange(_event: SyntheticEvent, newValue: string): void {
    setValue(newValue)
  }

  return (
    <PlausibleLocalProvider>
      <Container>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange}>
              <Tab label="Internal" value="1" />
              <Tab label="Plausible" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Stack spacing={5}>
              <PlausibleFilter />
              <PlausibleTopCards />
              <PlausibleChart />
            </Stack>
          </TabPanel>
          <TabPanel value="2">
            <Stack spacing={5}>{children}</Stack>
          </TabPanel>
        </TabContext>
      </Container>
    </PlausibleLocalProvider>
  )
}

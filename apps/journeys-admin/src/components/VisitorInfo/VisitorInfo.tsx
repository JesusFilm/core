import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactElement, SyntheticEvent, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { VisitorDetail } from './VisitorDetail'
import { VisitorJourneysList } from './VisitorJourneysList'
import { VisitorInfoProvider } from './VisitorInfoProvider'
import { VisitorJourneyDrawer } from './VisitorJourneyDrawer'
import { DRAWER_WIDTH } from './VisitorJourneyDrawer/VisitorJourneyDrawer'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  const [activeTab, setActiveTab] = useState(0)

  const handleChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue)
  }

  return (
    <VisitorInfoProvider>
      <Box
        sx={{
          marginRight: { sm: `${DRAWER_WIDTH}px` }
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: (theme) => theme.palette.background.paper
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="visitor info tabs"
          >
            <Tab label="Details" {...tabA11yProps('visitor-info', 0)} />
            <Tab label="Journeys" {...tabA11yProps('visitor-info', 1)} />
          </Tabs>
        </Box>
        <Container sx={{ py: 4 }}>
          <TabPanel name="visitor-info" value={activeTab} index={0}>
            <VisitorDetail id={id} />
          </TabPanel>
          <TabPanel name="visitor-info" value={activeTab} index={1}>
            <VisitorJourneysList id={id} />
          </TabPanel>
        </Container>
      </Box>
      <VisitorJourneyDrawer />
    </VisitorInfoProvider>
  )
}

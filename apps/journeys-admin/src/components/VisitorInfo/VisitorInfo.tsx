import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactElement, SyntheticEvent, useState } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { VisitorDetail } from './VisitorDetail'
import { VisitorJourneyList } from './VisitorJourneyList'

interface Props {
  id: string
}

export function VisitorInfo({ id }: Props): ReactElement {
  const [activeTab, setActiveTab] = useState(0)

  const handleChange = (_event: SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue)
  }

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
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
          <Tab
            label="Details"
            {...tabA11yProps('visitor-info', 0)}
            sx={{ flexGrow: 1 }}
          />
          <Tab
            label="Journeys"
            {...tabA11yProps('visitor-info', 1)}
            sx={{ flexGrow: 1 }}
          />
        </Tabs>
      </Box>
      <TabPanel name="visitor-info" value={activeTab} index={0}>
        <VisitorDetail id={id} />
      </TabPanel>
      <TabPanel name="visitor-info" value={activeTab} index={1}>
        <VisitorJourneyList id={id} />
      </TabPanel>
    </Box>
  )
}

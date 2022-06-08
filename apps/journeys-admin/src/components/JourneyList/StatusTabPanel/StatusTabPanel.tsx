import { ReactElement, SyntheticEvent, useState } from 'react'
import { sortBy } from 'lodash'
import Card from '@mui/material/Card'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { JourneySort, SortOrder } from '../JourneySort'
import { JourneyCard } from '../JourneyCard'
import { ActiveJourneysTab } from './ActiveJourneysTab'

interface StatusTabPanelProps {
  journeys?: Journey[]
}

export function StatusTabPanel({
  journeys
}: StatusTabPanelProps): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const [activeTab, setActiveTab] = useState(0)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? sortBy(journeys, 'title')
      : sortBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setActiveTab(newValue)
  }

  return (
    <>
      {journeys != null ? (
        <>
          {!smUp && (
            <Box sx={{ my: 4, ml: 6 }}>
              <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
            </Box>
          )}
          <Card
            variant="outlined"
            sx={{
              mt: { xs: 0, sm: 6 },
              borderColor: 'divider',
              borderBottom: 'none',
              borderTopLeftRadius: { xs: 0, sm: 12 },
              borderTopRightRadius: { xs: 0, sm: 12 },
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleChange}
              aria-label="journey status tabs"
              data-testid="journey-list"
            >
              <Tab label="Active" {...tabA11yProps('status-panel', 0)} />
              {smUp && (
                <Box
                  sx={{
                    mr: 6,
                    ml: 'auto',
                    mt: 3,
                    mb: 2
                  }}
                >
                  <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
                </Box>
              )}
            </Tabs>
          </Card>
          <TabPanel name="status-panel" value={activeTab} index={0}>
            <ActiveJourneysTab journeys={sortedJourneys} />
          </TabPanel>
        </>
      ) : (
        <>
          {!smUp && (
            <Box sx={{ my: 4, ml: 6 }}>
              <Chip label="Sort By" variant="outlined" disabled />
            </Box>
          )}
          <Card
            variant="outlined"
            sx={{
              borderColor: 'divider',
              borderBottom: 'none',
              mt: { xs: 0, sm: 6 },
              borderTopLeftRadius: { xs: 0, sm: 12 },
              borderTopRightRadius: { xs: 0, sm: 12 },
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0
            }}
          >
            <Tabs
              value={activeTab}
              aria-label="journey status tabs"
              data-testid="journey-list"
            >
              <Tab label="Active" disabled />
              <Tab label="Archived" disabled />
              <Tab label="Deleted" disabled />
              {smUp && (
                <Box
                  sx={{
                    mr: 6,
                    ml: 'auto',
                    mt: 3,
                    mb: 2
                  }}
                >
                  <Chip label="Sort By" variant="outlined" disabled />
                </Box>
              )}
            </Tabs>
          </Card>
          <JourneyCard />
          <JourneyCard />
          <JourneyCard />
          <JourneyCard />
        </>
      )}
    </>
  )
}

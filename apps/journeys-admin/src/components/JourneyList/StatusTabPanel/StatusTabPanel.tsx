import { ReactElement, SyntheticEvent, useState } from 'react'
import { sortBy } from 'lodash'
import Card from '@mui/material/Card'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/router'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { JourneySort, SortOrder } from '../JourneySort'
import { ActiveJourneysTab } from './ActiveJourneysTab'
import { TabLoadingSkeleton } from './TabLoadingSkeleton'

interface StatusTabPanelProps {
  journeys?: Journey[]
}

interface StatusTab {
  queryParam: string
  displayValue: string
  tabIndex: number
}

const journeyStatusTabs: StatusTab[] = [
  {
    queryParam: 'active',
    displayValue: 'Active',
    tabIndex: 0
  },
  {
    queryParam: 'archived',
    displayValue: 'Archived',
    tabIndex: 1
  },
  {
    queryParam: 'deleted',
    displayValue: 'Deleted',
    tabIndex: 2
  }
]

export function StatusTabPanel({
  journeys
}: StatusTabPanelProps): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const router = useRouter()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const tabIndex =
    journeyStatusTabs.find((status) => status.queryParam === router.query.tab)
      ?.tabIndex ?? 0
  const [activeTab, setActiveTab] = useState(tabIndex)

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
    // handle change can't be tested until more tabs are added
    setActiveTab(newValue)
    const tabParam =
      journeyStatusTabs.find((status) => status.tabIndex === newValue)
        ?.queryParam ?? journeyStatusTabs[0].queryParam

    router.query.tab = tabParam
    void router.push(router)
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
              <Tab
                label={journeyStatusTabs[0].displayValue}
                {...tabA11yProps('status-panel', journeyStatusTabs[0].tabIndex)}
              />
              {/* Here */}
              <Tab
                label={journeyStatusTabs[1].displayValue}
                {...tabA11yProps('status-panel', 1)}
              />
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

          <TabPanel
            name="status-panel"
            value={activeTab}
            index={journeyStatusTabs[0].tabIndex}
          >
            <ActiveJourneysTab journeys={sortedJourneys} />
          </TabPanel>
          {/* Here */}
          <TabPanel
            name="status-panel"
            value={activeTab}
            index={journeyStatusTabs[1].tabIndex}
          >
            <ActiveJourneysTab journeys={sortedJourneys} />
          </TabPanel>
        </>
      ) : (
        <TabLoadingSkeleton />
      )}
    </>
  )
}

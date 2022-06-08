import { ReactElement, SyntheticEvent, useState } from 'react'
import { sortBy } from 'lodash'
import Card from '@mui/material/Card'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
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
          <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
          <Card
            variant="outlined"
            sx={{
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
            </Tabs>
          </Card>
          <TabPanel name="status-panel" value={activeTab} index={0}>
            <ActiveJourneysTab journeys={sortedJourneys} />
          </TabPanel>
        </>
      ) : (
        <>
          <JourneyCard />
          <JourneyCard />
          <JourneyCard />
          <JourneyCard />
        </>
      )}
    </>
  )
}

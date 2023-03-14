import {
  Dispatch,
  ReactElement,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useState
} from 'react'
import Paper from '@mui/material/Paper'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Box from '@mui/material/Box'
import { NextRouter } from 'next/router'
import { JourneySort, SortOrder } from '../JourneyList/JourneySort'

export interface StatusTabPanelProps {
  activeList: ReactElement
  archivedList: ReactElement
  trashedList: ReactElement
  activeTabLoaded: boolean
  setActiveEvent: (event: string) => void
  setSortOrder: Dispatch<SetStateAction<SortOrder | undefined>>
  sortOrder?: SortOrder
  router?: NextRouter
}

interface StatusOptions {
  queryParam: string
  displayValue: string
  tabIndex: number
}

export function StatusTabPanel({
  activeList,
  archivedList,
  trashedList,
  activeTabLoaded,
  setActiveEvent,
  setSortOrder,
  sortOrder,
  router
}: StatusTabPanelProps): ReactElement {
  const journeyStatusTabs: StatusOptions[] = [
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
      queryParam: 'trashed',
      displayValue: 'Trash',
      tabIndex: 2
    }
  ]

  const [tabsLoaded, setTabsLoaded] = useState(false)

  useEffect(() => {
    if (activeTabLoaded) {
      setTabsLoaded(true)
    }
  }, [activeTabLoaded])

  const tabIndex =
    router != null
      ? journeyStatusTabs.find(
          (status) => status.queryParam === router.query?.tab
        )?.tabIndex ?? 0
      : 0
  const [activeTab, setActiveTab] = useState(tabIndex)

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    if (newValue != null && router != null) {
      setActiveTab(newValue)
      // ensure tab data is refreshed on change
      switch (newValue) {
        case 0:
          setActiveEvent('refetchActive')
          break
        case 1:
          setActiveEvent('refetchArchived')
          break
        case 2:
          setActiveEvent('refetchTrashed')
          break
      }
      setTimeout(() => {
        setActiveEvent('')
      }, 1000)
      const tabParam =
        journeyStatusTabs.find((status) => status.tabIndex === newValue)
          ?.queryParam ?? journeyStatusTabs[0].queryParam
      void router.push(
        {
          href: '/',
          query: { tab: tabParam }
        },
        undefined,
        { shallow: true }
      )
    }
  }

  return (
    <>
      <Box sx={{ ml: 6, mb: 4, display: { xs: 'block', sm: 'none' } }}>
        <JourneySort
          sortOrder={sortOrder}
          onChange={setSortOrder}
          disabled={!tabsLoaded}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          width: 'inherit',
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
            {...tabA11yProps(
              'active-status-panel',
              journeyStatusTabs[0].tabIndex
            )}
            disabled={!tabsLoaded}
          />
          <Tab
            label={journeyStatusTabs[1].displayValue}
            {...tabA11yProps(
              'archived-status-panel',
              journeyStatusTabs[1].tabIndex
            )}
            disabled={!tabsLoaded}
          />
          <Tab
            label={journeyStatusTabs[2].displayValue}
            {...tabA11yProps(
              'trashed-status-panel',
              journeyStatusTabs[2].tabIndex
            )}
            disabled={!tabsLoaded}
          />

          <Box
            sx={{
              mr: 6,
              ml: 'auto',
              mt: 3,
              mb: 2,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <JourneySort
              sortOrder={sortOrder}
              onChange={setSortOrder}
              disabled={!tabsLoaded}
            />
          </Box>
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <TabPanel
          name="active-status-panel"
          value={activeTab}
          index={journeyStatusTabs[0].tabIndex}
          sx={{ width: 'inherit' }}
        >
          {activeList}
        </TabPanel>
      )}
      {activeTab === 1 && (
        <TabPanel
          name="archived-status-panel"
          value={activeTab}
          index={journeyStatusTabs[1].tabIndex}
          sx={{ width: 'inherit' }}
        >
          {archivedList}
        </TabPanel>
      )}
      {activeTab === 2 && (
        <TabPanel
          name="trashed-status-panel"
          value={activeTab}
          index={journeyStatusTabs[2].tabIndex}
          sx={{ width: 'inherit' }}
        >
          {trashedList}
        </TabPanel>
      )}
    </>
  )
}

import { NextRouter } from 'next/router'
import { ReactElement, useState, useEffect, SyntheticEvent } from 'react'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import { AuthUser } from 'next-firebase-auth'
import { JourneySort, SortOrder } from '../../JourneyList/JourneySort'
import { ActiveTemplates } from './ActiveTemplates'
import { ArchivedTemplates } from './ArchivedTemplates'
import { TrashedTemplates } from './TrashedTemplates'

interface TemplateStatusTabsProps {
  event: string | undefined
  router?: NextRouter
  authUser?: AuthUser | undefined
}

interface TabOptions {
  queryParam: string
  displayValue: string
  tabIndex: number
}

const tabs: TabOptions[] = [
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

export function TemplateStatusTabs({
  event,
  router,
  authUser
}: TemplateStatusTabsProps): ReactElement {
  const tabIndex =
    router != null
      ? tabs.find((status) => status.queryParam === router.query?.tab)
          ?.tabIndex ?? 0
      : 0

  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [activeEvent, setActiveEvent] = useState(event)
  const [tabsLoaded, setTabsLoaded] = useState(false)
  const [activeTabLoaded, setActiveTabLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState(tabIndex)

  function activeTabOnLoad(): void {
    setActiveTabLoaded(true)
  }

  useEffect(() => {
    if (activeTabLoaded) {
      setTabsLoaded(true)
    }
  }, [activeTabLoaded])

  useEffect(() => {
    setActiveEvent(event)
  }, [event])

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    if (newValue != null && router != null) {
      setActiveTab(newValue)

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
        tabs.find((status) => status.tabIndex === newValue)?.queryParam ??
        tabs[0].queryParam
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
      <Box sx={{ my: 4, ml: 6, display: smUp ? 'none' : 'block' }}>
        <JourneySort
          sortOrder={sortOrder}
          onChange={setSortOrder}
          disabled={!tabsLoaded}
        />
      </Box>

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
            label={tabs[0].displayValue}
            {...tabA11yProps('active-status-panel', tabs[0].tabIndex)}
            disabled={!tabsLoaded}
          />
          <Tab
            label={tabs[1].displayValue}
            {...tabA11yProps('archived-status-panel', tabs[1].tabIndex)}
            disabled={!tabsLoaded}
          />
          <Tab
            label={tabs[2].displayValue}
            {...tabA11yProps('trashed-status-panel', tabs[2].tabIndex)}
            disabled={!tabsLoaded}
          />
          <Box
            sx={{
              mr: 6,
              ml: 'auto',
              mt: 3,
              mb: 2,
              display: !smUp ? 'none' : 'block'
            }}
          >
            <JourneySort
              sortOrder={sortOrder}
              onChange={setSortOrder}
              disabled={!tabsLoaded}
            />
          </Box>
        </Tabs>
      </Card>

      {activeTab === 0 && (
        <TabPanel
          name="active-status-panel"
          value={activeTab}
          index={tabs[0].tabIndex}
        >
          <ActiveTemplates
            onLoad={activeTabOnLoad}
            event={activeEvent}
            sortOrder={sortOrder}
            authUser={authUser}
          />
        </TabPanel>
      )}
      {activeTab === 1 && (
        <TabPanel
          name="archived-status-panel"
          value={activeTab}
          index={tabs[1].tabIndex}
        >
          <ArchivedTemplates
            onLoad={activeTabOnLoad}
            event={activeEvent}
            sortOrder={sortOrder}
            authUser={authUser}
          />
        </TabPanel>
      )}
      {activeTab === 2 && (
        <TabPanel
          name="trashed-status-panel"
          value={activeTab}
          index={tabs[2].tabIndex}
        >
          <TrashedTemplates
            onLoad={activeTabOnLoad}
            event={activeEvent}
            sortOrder={sortOrder}
            authUser={authUser}
          />
        </TabPanel>
      )}
    </>
  )
}

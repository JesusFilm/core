import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { NextRouter } from 'next/router'
import { AuthUser } from 'next-firebase-auth'
import { JourneySort, SortOrder } from '../JourneySort'
import { ActiveStatusTab } from './ActiveStatusTab'
import { ArchivedStatusTab } from './ArchivedStatusTab'
import { TrashedStatusTab } from './TrashedStatusTab'

export interface StatusTabPanelProps {
  router?: NextRouter
  event: string | undefined
  authUser?: AuthUser | undefined
}

interface StatusOptions {
  queryParam: string
  displayValue: string
  tabIndex: number
}

export function StatusTabPanel({
  router,
  event,
  authUser
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

  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const [tabsLoaded, setTabsLoaded] = useState(false)
  const [activeTabLoaded, setActiveTabLoaded] = useState(false)
  const [activeEvent, setActiveEvent] = useState(event)

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
            index={journeyStatusTabs[0].tabIndex}
          >
            <ActiveStatusTab
              onLoad={activeTabOnLoad}
              sortOrder={sortOrder}
              event={activeEvent}
              authUser={authUser}
            />
          </TabPanel>
        )}
        {activeTab === 1 && (
          <TabPanel
            name="archived-status-panel"
            value={activeTab}
            index={journeyStatusTabs[1].tabIndex}
          >
            <ArchivedStatusTab
              onLoad={activeTabOnLoad}
              sortOrder={sortOrder}
              event={activeEvent}
              authUser={authUser}
            />
          </TabPanel>
        )}
        {activeTab === 2 && (
          <TabPanel
            name="trashed-status-panel"
            value={activeTab}
            index={journeyStatusTabs[2].tabIndex}
          >
            <TrashedStatusTab
              onLoad={activeTabOnLoad}
              sortOrder={sortOrder}
              event={activeEvent}
              authUser={authUser}
            />
          </TabPanel>
        )}
      </>
    </>
  )
}

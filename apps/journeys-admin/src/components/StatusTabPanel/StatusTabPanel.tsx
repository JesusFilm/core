import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  SyntheticEvent,
  useState
} from 'react'

import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import type { JourneyListEvent } from '../JourneyList/JourneyList'
import { JourneyListMenu } from '../JourneyList/JourneyListMenu'
import { JourneySort, SortOrder } from '../JourneyList/JourneySort'

export interface StatusTabPanelProps {
  activeList: ReactElement
  archivedList: ReactElement
  trashedList: ReactElement
  setActiveEvent: (event: JourneyListEvent) => void
  setSortOrder: Dispatch<SetStateAction<SortOrder | undefined>>
  sortOrder?: SortOrder
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
  setActiveEvent,
  setSortOrder,
  sortOrder
}: StatusTabPanelProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const journeyStatusTabs: StatusOptions[] = [
    {
      queryParam: 'active',
      displayValue: t('Active'),
      tabIndex: 0
    },
    {
      queryParam: 'archived',
      displayValue: t('Archived'),
      tabIndex: 1
    },
    {
      queryParam: 'trashed',
      displayValue: t('Trash'),
      tabIndex: 2
    }
  ]

  const tabIndex =
    journeyStatusTabs.find((status) => status.queryParam === router?.query?.tab)
      ?.tabIndex ?? 0
  const [activeTab, setActiveTab] = useState(tabIndex)

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    if (newValue != null) {
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
      const tabParam =
        journeyStatusTabs.find((status) => status.tabIndex === newValue)
          ?.queryParam ?? journeyStatusTabs[0].queryParam
      void router.push(
        {
          query: { tab: tabParam }
        },
        undefined,
        { shallow: true }
      )
    }
  }

  return (
    <>
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
        />
        <Tab
          label={journeyStatusTabs[1].displayValue}
          {...tabA11yProps(
            'archived-status-panel',
            journeyStatusTabs[1].tabIndex
          )}
        />
        <Tab
          label={journeyStatusTabs[2].displayValue}
          {...tabA11yProps(
            'trashed-status-panel',
            journeyStatusTabs[2].tabIndex
          )}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center'
          }}
        >
          <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <JourneyListMenu onClick={setActiveEvent} />
        </Box>
      </Tabs>
      <TabPanel
        name="active-status-panel"
        value={activeTab}
        index={journeyStatusTabs[0].tabIndex}
        unmountUntilVisible={
          router?.query?.tab !== undefined && router?.query?.tab !== 'active'
        }
      >
        {activeList}
      </TabPanel>
      <TabPanel
        name="archived-status-panel"
        value={activeTab}
        index={journeyStatusTabs[1].tabIndex}
        unmountUntilVisible={router?.query?.tab !== 'archived'}
      >
        {archivedList}
      </TabPanel>
      <TabPanel
        name="trashed-status-panel"
        value={activeTab}
        index={journeyStatusTabs[2].tabIndex}
        unmountUntilVisible={router?.query?.tab !== 'trashed'}
      >
        {trashedList}
      </TabPanel>
    </>
  )
}

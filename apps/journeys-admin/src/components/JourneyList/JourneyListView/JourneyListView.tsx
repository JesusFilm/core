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
  useEffect,
  useState
} from 'react'

import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import type { JourneyListEvent } from '../JourneyList'
import { JourneyListMenu } from '../JourneyListMenu'
import { JourneySort, SortOrder } from '../JourneySort'
import { JourneyStatusFilter } from '../JourneyStatusFilter'

export type ContentType = 'journeys' | 'templates'
export type JourneyStatus = 'active' | 'archived' | 'trashed'

export interface JourneyListViewProps {
  // Render function that receives contentType and status to render the appropriate list
  renderList: (contentType: ContentType, status: JourneyStatus) => ReactElement
  // Event handlers
  setActiveEvent: (event: JourneyListEvent) => void
  setSortOrder: Dispatch<SetStateAction<SortOrder | undefined>>
  sortOrder?: SortOrder
}

interface ContentTypeOption {
  queryParam: ContentType
  displayValue: string
  tabIndex: number
}

// Helper function to get refetch event based on status
const getRefetchEvent = (status: JourneyStatus): JourneyListEvent => {
  switch (status) {
    case 'active':
      return 'refetchActive'
    case 'archived':
      return 'refetchArchived'
    case 'trashed':
      return 'refetchTrashed'
  }
}

export function JourneyListView({
  renderList,
  setActiveEvent,
  setSortOrder,
  sortOrder
}: JourneyListViewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const breakpoints = useBreakpoints()

  // Content type options (Journeys, Templates)
  // Use shorter labels on mobile to prevent overflow
  const contentTypeOptions: ContentTypeOption[] = [
    {
      queryParam: 'journeys',
      displayValue: breakpoints.sm ? t('Team Projects') : t('Projects'),
      tabIndex: 0
    },
    {
      queryParam: 'templates',
      displayValue: breakpoints.sm ? t('Team Templates') : t('Templates'),
      tabIndex: 1
    }
  ]

  // Get initial values from router query params
  const contentTypeFromQuery =
    (router?.query?.type as ContentType) ?? 'journeys'
  const statusFromQuery = (router?.query?.status as JourneyStatus) ?? 'active'

  // State management
  const contentTypeTabIndex =
    contentTypeOptions.find(
      (option) => option.queryParam === contentTypeFromQuery
    )?.tabIndex ?? 0
  const [activeContentTypeTab, setActiveContentTypeTab] =
    useState(contentTypeTabIndex)
  const [selectedStatus, setSelectedStatus] =
    useState<JourneyStatus>(statusFromQuery)

  // Sync state with router query params when they change externally
  useEffect(() => {
    const contentTypeFromRouter =
      (router?.query?.type as ContentType) ?? 'journeys'
    const statusFromRouter =
      (router?.query?.status as JourneyStatus) ?? 'active'

    const contentTypeIndex =
      contentTypeOptions.find(
        (option) => option.queryParam === contentTypeFromRouter
      )?.tabIndex ?? 0

    if (contentTypeIndex !== activeContentTypeTab) {
      setActiveContentTypeTab(contentTypeIndex)
    }

    if (statusFromRouter !== selectedStatus) {
      setSelectedStatus(statusFromRouter)
    }
  }, [
    router?.query?.type,
    router?.query?.status,
    contentTypeOptions,
    activeContentTypeTab,
    selectedStatus
  ])

  // Handle content type tab change (Journeys <-> Templates)
  const handleContentTypeChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    if (newValue != null) {
      setActiveContentTypeTab(newValue)
      const contentTypeParam =
        contentTypeOptions.find((option) => option.tabIndex === newValue)
          ?.queryParam ?? contentTypeOptions[0].queryParam

      // Trigger refetch event for the current status
      setActiveEvent(getRefetchEvent(selectedStatus))

      void router.push(
        {
          query: {
            ...router.query,
            type: contentTypeParam
          }
        },
        undefined,
        { shallow: true }
      )
    }
  }

  // Handle status filter dropdown change
  const handleStatusChange = (newStatus: JourneyStatus): void => {
    setSelectedStatus(newStatus)

    // Trigger refetch event for the new status
    setActiveEvent(getRefetchEvent(newStatus))

    void router.push(
      {
        query: {
          ...router.query,
          status: newStatus
        }
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <>
      <Tabs
        value={activeContentTypeTab}
        onChange={handleContentTypeChange}
        aria-label="journey content type tabs"
        data-testid="journey-list-view"
        sx={{
          // Allow overflow to prevent hover circle on JourneyListMenu from being clipped
          // MUI Tabs uses an internal scroller with overflow: hidden by default
          overflow: 'visible',
          pr: 2,
          '& .MuiTabs-scroller': {
            overflow: 'visible !important'
          },
          '& .MuiTab-root': {
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '21px'
          }
        }}
      >
        <Tab
          label={contentTypeOptions[0].displayValue}
          {...tabA11yProps(
            'journeys-content-panel',
            contentTypeOptions[0].tabIndex
          )}
        />
        <Tab
          label={contentTypeOptions[1].displayValue}
          {...tabA11yProps(
            'templates-content-panel',
            contentTypeOptions[1].tabIndex
          )}
        />
        {/* Status filter dropdown - visible for both tabs */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            ml: 'auto',
            mr: 0
          }}
        >
          <JourneyStatusFilter
            status={selectedStatus}
            onChange={handleStatusChange}
          />
        </Box>
        {/* Sort component */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            ml: { xs: 1, sm: 0 }
          }}
        >
          <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
        </Box>
        {/* Menu component */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            ml: { xs: 1, sm: 0 },
            mr: {
              xs: 1,
              sm: router?.query?.type === 'templates' ? -12 : -8
            }
          }}
        >
          <JourneyListMenu onClick={setActiveEvent} />
        </Box>
      </Tabs>
      {/* Journeys tab panel */}
      <TabPanel
        name="journeys-content-panel"
        value={activeContentTypeTab}
        index={contentTypeOptions[0].tabIndex}
        unmountUntilVisible={
          router?.query?.type !== undefined &&
          router?.query?.type !== 'journeys'
        }
      >
        {renderList('journeys', selectedStatus)}
      </TabPanel>
      {/* Templates tab panel */}
      <TabPanel
        name="templates-content-panel"
        value={activeContentTypeTab}
        index={contentTypeOptions[1].tabIndex}
        unmountUntilVisible={
          router?.query?.type !== undefined &&
          router?.query?.type !== 'templates'
        }
      >
        {renderList('templates', selectedStatus)}
      </TabPanel>
    </>
  )
}

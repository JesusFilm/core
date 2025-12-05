import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
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

import type { JourneyListEvent } from '../JourneyList'
import { JourneyListMenu } from '../JourneyListMenu'
import { JourneySort, SortOrder } from '../JourneySort'

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

interface StatusOption {
  queryParam: JourneyStatus
  displayValue: string
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

  // Content type options (Journeys, Templates)
  const contentTypeOptions: ContentTypeOption[] = [
    {
      queryParam: 'journeys',
      displayValue: t('Team Projects'),
      tabIndex: 0
    },
    {
      queryParam: 'templates',
      displayValue: t('Team Templates'),
      tabIndex: 1
    }
  ]

  // Status filter options (Active, Archived, Trashed)
  const statusOptions: StatusOption[] = [
    {
      queryParam: 'active',
      displayValue: t('Active')
    },
    {
      queryParam: 'archived',
      displayValue: t('Archived')
    },
    {
      queryParam: 'trashed',
      displayValue: t('Trash')
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
  const handleStatusChange = (
    event: SelectChangeEvent<JourneyStatus>
  ): void => {
    const newStatus = event.target.value as JourneyStatus
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
            alignItems: 'center',
            ml: 'auto',
            mr: 2
          }}
        >
          <FormControl size="small">
            <Select
              id="status-filter-select"
              value={selectedStatus}
              onChange={handleStatusChange}
              inputProps={{ 'aria-label': t('Filter by status') }}
              IconComponent={KeyboardArrowDown}
              autoWidth
              sx={{
                borderRadius: '8px',
                height: '32px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                '& .MuiOutlinedInput-root': {
                  height: '32px'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                  borderColor: (theme) => theme.palette.text.secondary
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '2px',
                  borderColor: (theme) => theme.palette.text.secondary
                },
                '& .MuiOutlinedInput-input': {
                  padding: '0 !important',
                  height: '32px',
                  boxSizing: 'border-box'
                },
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '14px',
                  paddingTop: '6px !important',
                  paddingBottom: '6px !important',
                  paddingLeft: '14px !important',
                  paddingRight: '28px !important'
                },
                '& .MuiSelect-icon': {
                  fontSize: '1rem'
                }
              }}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status.queryParam} value={status.queryParam}>
                  {status.displayValue}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {/* Sort component */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center'
          }}
        >
          <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
        </Box>
        {/* Menu component */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: router?.query?.type === 'templates' ? -12 : -8
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

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

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import type { JourneyListEvent } from '../JourneyList'
import { SortOrder } from '../JourneySort'
import { SharedWithMeMode } from './DisplayModes/SharedWithMeMode/SharedWithMeMode'
import { ContentTypeOption, TeamMode } from './DisplayModes/TeamMode/TeamMode'

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

// Re-export ContentTypeOption for external use
export type { ContentTypeOption } from './DisplayModes/TeamMode/TeamMode'

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
  const { activeTeam } = useTeam()
  const isSharedWithMeMode = activeTeam === null

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

  // Force type=journeys in Shared With Me mode
  useEffect(() => {
    if (isSharedWithMeMode && router?.query?.type !== 'journeys') {
      void router.push(
        {
          query: {
            ...router.query,
            type: 'journeys'
          }
        },
        undefined,
        { shallow: true }
      )
    }
  }, [isSharedWithMeMode, router])

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

  if (isSharedWithMeMode) {
    return (
      <SharedWithMeMode
        selectedStatus={selectedStatus}
        handleStatusChange={handleStatusChange}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        setActiveEvent={setActiveEvent}
        renderList={renderList}
      />
    )
  }

  return (
    <TeamMode
      activeContentTypeTab={activeContentTypeTab}
      handleContentTypeChange={handleContentTypeChange}
      contentTypeOptions={contentTypeOptions}
      selectedStatus={selectedStatus}
      handleStatusChange={handleStatusChange}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      setActiveEvent={setActiveEvent}
      router={router}
      renderList={renderList}
    />
  )
}

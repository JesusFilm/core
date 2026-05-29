import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
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
  /**
   * True when the NES-1538 Template Info side panel is mounted alongside
   * this view (templates tab + teamTemplateCollection on). Forwarded to
   * TeamMode so the 3-dots overflow menu's negative right-margin overhang
   * (`menuMarginRight`) can shrink and not collide with the panel's left
   * edge.
   *
   * Why this exists: the desktop info panel renders as a `permanent` MUI
   * `Drawer` (`position: fixed` via Portal), not as a flex sibling of the
   * grid. Flexbox can't reserve space for the panel's column, so the menu's
   * negative-margin overhang has to be tuned manually whenever the panel is
   * mounted. Removing the Drawer in favour of an in-flow column would let
   * this prop go.
   */
  infoPanelActive?: boolean
  /**
   * Opt-in trial state for the new folder-based templates view (NES-1695).
   * When true, the Templates tab content renders the new design and the
   * Tabs row hides Status + Sort controls (the folder system replaces
   * them). Forwarded to TeamMode for the toggle Switch and the conditional
   * controls.
   */
  newViewEnabled?: boolean
  /**
   * Setter for `newViewEnabled`. Bound to the Switch in TeamMode's Tabs
   * row. Owner: JourneyList (state lives there so both the Tabs row and
   * the templates panel share it).
   */
  onNewViewEnabledChange?: (next: boolean) => void
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
  sortOrder,
  infoPanelActive = false,
  newViewEnabled = false,
  onNewViewEnabledChange
}: JourneyListViewProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const breakpoints = useBreakpoints()
  const { activeTeam } = useTeam()
  const isSharedWithMeMode = activeTeam === null

  // Content type options (Journeys, Templates).
  // The Collections panel lives under Team Templates and is gated by the
  // `teamTemplateCollection` flag in JourneyList.tsx.
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
  }, [isSharedWithMeMode, router?.query?.type])

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
      infoPanelActive={infoPanelActive}
      newViewEnabled={newViewEnabled}
      onNewViewEnabledChange={onNewViewEnabledChange}
    />
  )
}

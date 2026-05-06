import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { User } from '../../libs/auth/authContext'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { usePageWrapperStyles } from '../PageWrapper/utils/usePageWrapperStyles'
import { TemplateGalleryPageList } from '../TemplateGalleryPageList'

import { AddJourneyFab } from './AddJourneyFab'
import { JourneyListContent } from './JourneyListContent'
import { JourneyListView } from './JourneyListView'
import type { ContentType, JourneyStatusFilter } from './JourneyListView'
import { SortOrder } from './JourneySort'

export interface JourneyListProps {
  sortOrder?: SortOrder
  event?: JourneyListEvent
  user?: User | null
}

export type JourneyListEvent =
  | 'archiveAllActive'
  | 'trashAllActive'
  | 'refetchActive'
  | 'restoreAllArchived'
  | 'trashAllArchived'
  | 'refetchArchived'
  | 'restoreAllTrashed'
  | 'deleteAllTrashed'
  | 'refetchTrashed'

export function JourneyList({
  user
}: Pick<JourneyListProps, 'user'>): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const router = useRouter()
  const [event, setEvent] = useState<JourneyListEvent>()
  // When the flag is on, the Team Templates tab renders the Collections
  // panel (TemplateGalleryPageList) in place of the original list.
  const { teamTemplateCollection } = useFlags()
  const { refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })
  const { navbar, sidePanel } = usePageWrapperStyles()

  useEffect(() => {
    const sortByFromStorage = sessionStorage.getItem('journeyListSortBy')
    const isValidSort =
      sortByFromStorage != null &&
      Object.values(SortOrder).includes(sortByFromStorage as SortOrder)
    if (!isValidSort) return

    setSortOrder(sortByFromStorage as SortOrder)
  }, [])

  function handleSetSortOrder(order: SortOrder) {
    setSortOrder(order)
    sessionStorage.setItem('journeyListSortBy', order)
  }

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // for updating journey list cache for shallow loading
      if (url === '/' || url === '/publisher') {
        void refetch()
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [refetch, router.events])

  const handleClick = (event: JourneyListEvent): void => {
    setEvent(event)
    // remove event after component lifecycle
    setTimeout(() => {
      setEvent(undefined)
    }, 1000)
  }

  // Determine active tab from router query (support both old 'tab' and new 'status' params)
  const activeTab =
    (router?.query?.status as JourneyStatusFilter) ??
    (router?.query?.tab?.toString() === 'archived'
      ? 'archived'
      : router?.query?.tab?.toString() === 'trashed'
        ? 'trashed'
        : 'active')

  // Side panel is only visible for journeys tab, so expand width for templates and collections
  const currentContentType = (router?.query?.type as ContentType) ?? 'journeys'
  const sidePanelVisible = currentContentType === 'journeys'

  // Render function for JourneyListView
  const renderList = (
    contentType: ContentType,
    status: JourneyStatusFilter
  ): ReactElement => {
    // Only pass event to the currently active content type to prevent duplicate actions
    const eventForThisContentType =
      contentType === currentContentType ? event : undefined
    const list = (
      <JourneyListContent
        contentType={contentType}
        status={status}
        user={contentType === 'journeys' ? user : undefined}
        sortOrder={sortOrder}
        event={eventForThisContentType}
      />
    )
    // Collections panel is additive: it sits ABOVE the legacy team templates
    // list when the flag is on, so archive / trash / sort affordances on
    // individual templates remain reachable. Only show the gallery on the
    // Active status filter — Collections themselves don't have an archived
    // counterpart, and showing the gallery alongside an "Archived templates"
    // list would be confusing.
    if (
      contentType === 'templates' &&
      teamTemplateCollection === true &&
      status === 'active'
    ) {
      return (
        <>
          <TemplateGalleryPageList
            visible={contentType === currentContentType}
          />
          {list}
        </>
      )
    }
    return list
  }

  return (
    <>
      <Box
        sx={{
          mt: { xs: 0, sm: -5 },
          width: {
            sm: '100%',
            md: sidePanelVisible
              ? `calc(100vw - ${sidePanel.width} - ${navbar.width} - 80px)`
              : `calc(100vw - ${navbar.width} - 80px)`
          }
        }}
        data-testid="JourneysAdminJourneyList"
      >
        <JourneyListView
          renderList={renderList}
          setActiveEvent={handleClick}
          setSortOrder={handleSetSortOrder}
          sortOrder={sortOrder}
        />
      </Box>
      {activeTab === 'active' && currentContentType === 'journeys' && (
        <AddJourneyFab />
      )}
    </>
  )
}

import Box from '@mui/material/Box'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement, useEffect, useState } from 'react'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { usePageWrapperStyles } from '../PageWrapper/utils/usePageWrapperStyles'

import { AddJourneyFab } from './AddJourneyFab'
import { JourneyListContent } from './JourneyListContent'
import { JourneyListView } from './JourneyListView'
import type { ContentType, JourneyStatusFilter } from './JourneyListView'
import { SortOrder } from './JourneySort'

export interface JourneyListProps {
  sortOrder?: SortOrder
  event?: JourneyListEvent
  user?: User
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
  const { refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })
  const { navbar, sidePanel } = usePageWrapperStyles()

  useEffect(() => {
    if (!router.isReady) return
    const sortByFromQuery = router.query.sortBy as string
    const sortByFromStorage =
      typeof window !== 'undefined'
        ? localStorage.getItem('journeyListSortBy')
        : null
    const sortBy = sortByFromQuery || sortByFromStorage
    if (sortBy && Object.values(SortOrder).includes(sortBy as SortOrder)) {
      setSortOrder((prev) => (prev !== sortBy ? (sortBy as SortOrder) : prev))
      if (sortByFromQuery && typeof window !== 'undefined') {
        localStorage.setItem('journeyListSortBy', sortByFromQuery)
      } else if (sortByFromStorage && !sortByFromQuery) {
        void router.replace(
          { query: { ...router.query, sortBy: sortByFromStorage } },
          undefined,
          { shallow: true }
        )
      }
    }
  }, [router.isReady, router.query.sortBy, router])

  const handleSetSortOrder = (
    order: SortOrder | ((prev: SortOrder | undefined) => SortOrder | undefined)
  ) => {
    const newOrder = typeof order === 'function' ? order(sortOrder) : order
    if (newOrder) {
      setSortOrder(newOrder)
      if (router.isReady) {
        void router.push(
          { query: { ...router.query, sortBy: newOrder } },
          undefined,
          { shallow: true }
        )
      }
      if (typeof window !== 'undefined')
        localStorage.setItem('journeyListSortBy', newOrder)
    }
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

  // Side panel is only visible for journeys tab, so expand width for templates
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
    return (
      <JourneyListContent
        contentType={contentType}
        status={status}
        user={contentType === 'journeys' ? user : undefined}
        sortOrder={sortOrder}
        event={eventForThisContentType}
      />
    )
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

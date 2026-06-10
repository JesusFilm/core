import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { User } from '../../libs/auth/authContext'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { usePageWrapperStyles } from '../PageWrapper/utils/usePageWrapperStyles'
import { TemplateGalleryPageList } from '../TemplateGalleryPageList'
import { TemplateInfoPanel } from '../TemplateInfoPanel'

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
  const { t } = useTranslation('apps-journeys-admin')
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const router = useRouter()
  const [event, setEvent] = useState<JourneyListEvent>()
  /** Mobile-only state for the Template Info side panel drawer (NES-1538). */
  const [templateInfoDrawerOpen, setTemplateInfoDrawerOpen] = useState(false)
  // Opt-in trial of the new folder-based templates view (NES-1695). When
  // ON, the Team Templates tab renders PublishHero on desktop (and keeps
  // the original chip-row design on mobile) — and the page-level
  // Active/Last-modified/sort controls disappear from the Tabs row,
  // because the folder system replaces them. State lives here at the
  // shared parent of both the Tabs row (TeamMode) and the templates panel
  // (TemplateGalleryPageList), persisted via localStorage so the user's
  // choice survives navigation.
  const NEW_VIEW_STORAGE_KEY = 'nes1695-templates-new-view'
  const [newViewEnabled, setNewViewEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(NEW_VIEW_STORAGE_KEY) === 'true'
  })
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(NEW_VIEW_STORAGE_KEY, String(newViewEnabled))
  }, [newViewEnabled])
  // When the flag is on, the Team Templates tab renders the Collections
  // panel (TemplateGalleryPageList) in place of the original list.
  //
  // The NES-1538 educational side panel rides on the same gate — no separate
  // flag — because the panel only makes sense on the local-template surface
  // that this flag already controls.
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

  // The Template Info side panel (NES-1538) mounts beside the templates grid
  // when the Team Templates tab is active. It shares the
  // `teamTemplateCollection` gate with the Collections panel since the
  // educational panel only makes sense alongside that surface.
  const showTemplateInfoPanel =
    teamTemplateCollection === true && currentContentType === 'templates'

  // Close the mobile drawer if the user navigates away from the templates tab
  // or the flag flips off — prevents a stale-open drawer rendering on the
  // journeys tab if the user toggles between tabs while the drawer is open.
  useEffect(() => {
    if (!showTemplateInfoPanel && templateInfoDrawerOpen) {
      setTemplateInfoDrawerOpen(false)
    }
  }, [showTemplateInfoPanel, templateInfoDrawerOpen])

  const handleOpenTemplateInfoDrawer = (): void => {
    setTemplateInfoDrawerOpen(true)
  }
  const handleCloseTemplateInfoDrawer = (): void => {
    setTemplateInfoDrawerOpen(false)
  }

  // Render function for JourneyListView
  const renderList = (
    contentType: ContentType,
    status: JourneyStatusFilter
  ): ReactElement => {
    if (contentType === 'templates' && teamTemplateCollection === true) {
      return (
        <TemplateGalleryPageList
          visible={contentType === currentContentType}
          status={status}
          onOpenInfo={
            showTemplateInfoPanel ? handleOpenTemplateInfoDrawer : undefined
          }
          newViewEnabled={newViewEnabled}
        />
      )
    }
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
            md:
              sidePanelVisible || showTemplateInfoPanel
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
          infoPanelActive={showTemplateInfoPanel}
          newViewEnabled={newViewEnabled}
          onNewViewEnabledChange={setNewViewEnabled}
        />
      </Box>
      {activeTab === 'active' && currentContentType === 'journeys' && (
        <AddJourneyFab />
      )}
      {showTemplateInfoPanel && (
        <>
          {/* Desktop (md+): permanent MUI Drawer mirroring the journeys-tab
              SidePanel's desktopStyle so positioning, width, border, and
              rounded-top chrome all match the existing journeys panel without
              any custom maths. Stripping TemplateInfoPanel's outer chrome
              (border/bg/radius) lets the Drawer Paper own the visual frame. */}
          <Drawer
            elevation={1}
            anchor="right"
            variant="permanent"
            hideBackdrop
            data-testid="TemplateInfoPanelDesktop"
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: sidePanel.width,
              flexShrink: 1,
              '& .MuiDrawer-paper': {
                overflowX: 'hidden',
                boxSizing: 'border-box',
                width: sidePanel.width,
                height: 'calc(100% - 68px)',
                mt: 15.5,
                mr: 5,
                borderTopLeftRadius: { xs: 0, sm: 12 },
                borderTopRightRadius: { xs: 0, sm: 12 },
                border: '1px solid',
                borderColor: 'divider'
              }
            }}
          >
            <TemplateInfoPanel />
          </Drawer>
          {/* Mobile (xs/sm) trigger lives inline next to the Collections
              header inside TemplateGalleryPageList (NES-1686). The bottom
              SwipeableDrawer that the trigger opens stays here, owned by the
              same component that owns its open/close state. */}
          <SwipeableDrawer
            anchor="bottom"
            open={templateInfoDrawerOpen}
            onOpen={handleOpenTemplateInfoDrawer}
            onClose={handleCloseTemplateInfoDrawer}
            disableSwipeToOpen
            disableDiscovery
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                maxHeight: '80vh',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                overflowY: 'auto'
              }
            }}
          >
            <Stack
              data-testid="TemplateInfoPanelMobileDrawer"
              role="dialog"
              aria-labelledby="template-info-drawer-title"
              sx={{ position: 'relative' }}
            >
              {/* Drag-handle pill (visual swipe-to-dismiss affordance) */}
              <Box
                aria-hidden
                sx={{
                  width: 32,
                  height: 4,
                  bgcolor: 'divider',
                  borderRadius: 2,
                  mx: 'auto',
                  mt: 1.5,
                  mb: 0.5
                }}
              />
              {/* X close button — keyboard / tap fallback for swipe */}
              <IconButton
                aria-label={t('Close template info')}
                onClick={handleCloseTemplateInfoDrawer}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              {/* Hidden a11y title so aria-labelledby has something to point at */}
              <Box
                id="template-info-drawer-title"
                sx={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)'
                }}
              >
                {t('Template info')}
              </Box>
              <Box sx={{ p: 2 }}>
                <TemplateInfoPanel />
              </Box>
            </Stack>
          </SwipeableDrawer>
        </>
      )}
    </>
  )
}

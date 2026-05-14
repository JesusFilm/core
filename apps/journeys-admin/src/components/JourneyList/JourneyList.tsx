import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
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

/**
 * Width of the Template Info side panel (NES-1538) on `md+` viewports.
 * Matches Figma layout reference `39640-65061` where the panel sits at
 * 375px-wide inside the templates content area.
 */
const TEMPLATE_INFO_PANEL_WIDTH = 375

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
  // When the flag is on, the Team Templates tab renders the Collections
  // panel (TemplateGalleryPageList) in place of the original list.
  //
  // `templateInfoSidePanel` (NES-1538) gates the educational side panel that
  // sits beside the templates list. The flag itself is created in the
  // LaunchDarkly dashboard, not here — `useFlags` returns `undefined` for
  // unknown keys, so the `=== true` check keeps the panel hidden by default.
  const { teamTemplateCollection, templateInfoSidePanel } = useFlags()
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
  // when its LaunchDarkly flag is on and the user is viewing the Team
  // Templates tab. It piggy-backs on the existing `teamTemplateCollection`
  // gate because the local-template surface itself depends on that flag.
  const showTemplateInfoPanel =
    templateInfoSidePanel === true &&
    teamTemplateCollection === true &&
    currentContentType === 'templates'

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
            md: sidePanelVisible
              ? `calc(100vw - ${sidePanel.width} - ${navbar.width} - 80px)`
              : showTemplateInfoPanel
                ? `calc(100vw - ${TEMPLATE_INFO_PANEL_WIDTH}px - ${navbar.width} - 80px)`
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
      {showTemplateInfoPanel && (
        <>
          {/* Desktop (md+): static right-anchored column */}
          <Box
            data-testid="TemplateInfoPanelDesktop"
            sx={{
              display: { xs: 'none', md: 'block' },
              position: 'fixed',
              right: 40,
              top: 96,
              bottom: 24,
              width: TEMPLATE_INFO_PANEL_WIDTH,
              overflowY: 'auto'
            }}
          >
            <TemplateInfoPanel />
          </Box>
          {/* Mobile (xs/sm): floating Info button + bottom SwipeableDrawer */}
          <Box
            sx={{
              display: { xs: 'block', md: 'none' },
              position: 'fixed',
              top: 12,
              right: 12,
              zIndex: (theme) => theme.zIndex.appBar
            }}
          >
            <IconButton
              data-testid="TemplateInfoPanelMobileTrigger"
              aria-label={t('Open template info')}
              onClick={handleOpenTemplateInfoDrawer}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 1,
                '&:hover': { bgcolor: 'background.paper' }
              }}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </Box>
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
            PaperProps={{
              'aria-labelledby': 'template-info-drawer-title'
            }}
          >
            <Stack
              data-testid="TemplateInfoPanelMobileDrawer"
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

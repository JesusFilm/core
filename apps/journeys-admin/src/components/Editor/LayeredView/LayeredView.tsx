import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { DRAWER_GAP, DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Content } from '../Slider/Content'
import { LAYERED_DRAWER_HEIGHT } from '../Slider/Content/Canvas/utils/calculateDimensions'
import { JourneyFlow } from '../Slider/JourneyFlow'
import { Settings } from '../Slider/Settings'

export function LayeredView(): ReactElement {
  const {
    state: { activeSlide },
    dispatch
  } = useEditor()
  // Host the drawer + backdrop inside the journey-map container (below the app
  // bar) instead of portalling to <body>, so the overlay stops at the app bar:
  // the toolbar stays interactive and clicking outside the map does not close
  // the drawer.
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  const drawerOpen =
    activeSlide === ActiveSlide.Content || activeSlide === ActiveSlide.Drawer
  // The card and its properties open and close together: whenever the drawer is
  // open the settings panel is shown alongside the card, rather than the card
  // appearing on its own on the Content slide and the panel sliding in later.
  const settingsVisible = drawerOpen

  function handleDrawerClose(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }

  return (
    <Box
      ref={setContainer}
      data-testid="LayeredView"
      sx={{
        width: '100%',
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <JourneyFlow />
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        data-testid="LayeredViewDrawer"
        // Contain the drawer within the journey map: render into the map
        // container and position the modal + backdrop absolutely within it so
        // the overlay stops at the app bar. media libraries still portal to
        // <body> (see Settings/Drawer), so the focus trap must not wrestle
        // focus away from their inputs.
        ModalProps={{ container, disableEnforceFocus: true }}
        sx={{
          position: 'absolute',
          '& .MuiBackdrop-root': { position: 'absolute' },
          '& .MuiDrawer-paper': {
            position: 'absolute',
            height: LAYERED_DRAWER_HEIGHT,
            maxHeight: '100%',
            top: '50%',
            transform: 'translateY(-50%) !important',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
            // the transparent paper overlaps the dimmed backdrop; let clicks on
            // its empty areas fall through to the backdrop (which closes the
            // drawer). The card and settings re-enable pointer events below.
            pointerEvents: 'none'
          }
        }}
      >
        <Stack
          direction="row"
          data-testid="LayeredViewDrawerContent"
          sx={{
            // size to the content so panel widths never depend on each
            // other's minimum content width
            width: 'max-content',
            height: '100%',
            // breathing room so neither the card column nor the properties
            // panel runs to the top/bottom edges of the floating drawer; the
            // card scale (calculateLayeredScale) accounts for this reduced height
            py: 2,
            transform: settingsVisible
              ? 'translateX(0)'
              : `translateX(calc(${DRAWER_WIDTH}px + ${DRAWER_GAP * 2}px))`,
            opacity: drawerOpen ? 1 : 0,
            transition: 'transform 200ms ease-in-out, opacity 250ms ease-in-out'
          }}
        >
          <Content />
          <Box
            sx={{
              ml: `${DRAWER_GAP}px`,
              mr: `${DRAWER_GAP}px`,
              width: DRAWER_WIDTH,
              flexShrink: 0,
              // re-enable clicks on the settings panel (the paper is
              // pointer-events: none so empty areas close the drawer). The card
              // and panel open and close together, so the panel only needs to be
              // interactive while the drawer is open
              pointerEvents: settingsVisible ? 'auto' : 'none'
            }}
          >
            <Settings />
          </Box>
        </Stack>
      </Drawer>
    </Box>
  )
}

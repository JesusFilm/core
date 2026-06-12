import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Content } from '../Slider/Content'
import { CARD_HEIGHT } from '../Slider/Content/Canvas/utils/calculateDimensions'
import { JourneyFlow } from '../Slider/JourneyFlow'
import { Settings } from '../Slider/Settings'

const DRAWER_GAP = 16

export function LayeredView(): ReactElement {
  const {
    state: { activeSlide },
    dispatch
  } = useEditor()

  const drawerOpen =
    activeSlide === ActiveSlide.Content || activeSlide === ActiveSlide.Drawer
  const settingsVisible = activeSlide === ActiveSlide.Drawer

  function handleDrawerClose(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }

  return (
    <Box
      data-testid="LayeredView"
      sx={{
        width: '100%',
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        position: 'relative'
      }}
    >
      <JourneyFlow />
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        data-testid="LayeredViewDrawer"
        sx={{
          '& .MuiDrawer-paper': {
            height: `calc(${CARD_HEIGHT}px + 200px)`,
            maxHeight: '100%',
            top: '50%',
            transform: 'translateY(-50%) !important',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
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
            transform: settingsVisible
              ? 'translateX(0)'
              : `translateX(calc(${DRAWER_WIDTH}px + ${DRAWER_GAP * 2}px))`,
            opacity: drawerOpen ? 1 : 0,
            transition: 'transform 200ms ease-in-out, opacity 500ms ease-in-out'
          }}
        >
          <Content />
          <Box
            sx={{
              ml: `${DRAWER_GAP}px`,
              mr: `${DRAWER_GAP}px`,
              width: DRAWER_WIDTH,
              flexShrink: 0
            }}
          >
            <Settings />
          </Box>
        </Stack>
      </Drawer>
    </Box>
  )
}

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import { ReactElement } from 'react'
import { EDIT_TOOLBAR_HEIGHT } from '../constants'
import { JourneyFlow } from './JourneyFlow'
import { Content } from './Content'
import { Settings } from './Settings'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import {
  CARD_HEIGHT,
  CARD_WIDTH
} from './Content/Canvas/utils/calculateDimensions'
import { DRAWER_WIDTH } from '../constants'
import Stack from '@mui/material/Stack'

const CARD_GAP = 40
const DRAWER_GAP = 16

export function LayeredView(): ReactElement {
  const {
    state: { activeSlide },
    dispatch
  } = useEditor()

  const handleDrawerClose = () => {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.JourneyFlow
    })
  }

  const isDrawerOpen =
    activeSlide === ActiveSlide.Content || activeSlide === ActiveSlide.Drawer
  // const drawerWidth =
  //   activeSlide === ActiveSlide.Drawer
  //     ? `calc(${CARD_WIDTH}px + ${CARD_GAP}px + ${DRAWER_WIDTH}px) + ${DRAWER_GAP}px`
  //     : `calc(${CARD_WIDTH}px + 40px)`

  const drawerWidth = '100%'

  return (
    <Box
      sx={{
        width: '100%',
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        position: 'relative'
      }}
    >
      <JourneyFlow />
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        data-testid="item 1"
        sx={{
          '& .MuiDrawer-paper': {
            height: `calc(${CARD_HEIGHT}px + 200px)`,
            top: '50%',
            transform: 'translateY(-50%) !important',
            backgroundColor: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        <Stack
          direction="row"
          sx={{
            width: drawerWidth,
            height: '100%',
            transform:
              activeSlide === ActiveSlide.Drawer
                ? 'translateX(0)'
                : `translateX(calc(${DRAWER_WIDTH}px + ${DRAWER_GAP}px))`,
            opacity: isDrawerOpen ? 1 : 0,
            transition: 'transform 200ms ease-in-out, opacity 500ms ease-in-out'
          }}
        >
          <Content />
          <Box sx={{ mr: `${DRAWER_GAP}px`, width: DRAWER_WIDTH }}>
            <Settings />
          </Box>
        </Stack>
      </Drawer>
    </Box>
  )
}

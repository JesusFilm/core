import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Fade from '@mui/material/Fade'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveAction } from '@core/journeys/ui/EditorProvider/EditorProvider'

import {
  DRAWER_WIDTH,
  EDIT_TOOLBAR_HEIGHT,
  EDIT_TOOLBAR_MARGIN,
  TOTAL_EDIT_TOOLBAR_HEIGHT
} from '../constants'

import { Content } from './Content'
import { Settings } from './Settings'

function AnimatedContent({ show }: { show: boolean }): ReactElement {
  return (
    <Fade in={show} mountOnEnter>
      <Box
        sx={{
          height: { xs: '100%', md: 'auto' },
          width: { xs: '100%', md: 'auto' }
        }}
      >
        <Content />
      </Box>
    </Fade>
  )
}

export function EditorManager(): ReactElement {
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'))
  const { state, dispatch } = useEditor()

  if (mdUp) {
    return (
      <Drawer
        open={state.activeAction === ActiveAction.Edit}
        variant="persistent"
        anchor="right"
        sx={{
          '& .MuiDrawer-paperAnchorRight': {
            overflowY: 'visible',
            backgroundColor: 'transparent',
            height: `calc(100% - ${EDIT_TOOLBAR_HEIGHT + EDIT_TOOLBAR_MARGIN}px)`,
            width: DRAWER_WIDTH,
            top: `${TOTAL_EDIT_TOOLBAR_HEIGHT}px`,
            right: `${EDIT_TOOLBAR_MARGIN}px`,
            border: 'none'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            right: 'calc(100% + 16px)',
            visibility: 'visible',
            pointerEvents: 'none',
            userSelect: 'none',
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <AnimatedContent show={state.activeAction !== ActiveAction.Idle} />
        </Box>
        <Settings />
      </Drawer>
    )
  }

  return (
    <>
      <Backdrop
        open={state.activeAction !== ActiveAction.Idle}
        sx={{
          height: '100svh',
          width: '100svw',
          bgcolor: 'background.default',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 10,
          pt: `${TOTAL_EDIT_TOOLBAR_HEIGHT}px`
        }}
      >
        <AnimatedContent show={state.activeAction !== ActiveAction.Idle} />
      </Backdrop>
      <SwipeableDrawer
        open={state.activeAction === ActiveAction.Edit}
        onOpen={() => alert('Open Drawer')}
        onClose={() =>
          dispatch({ type: 'SetActiveAction', activeAction: ActiveAction.View })
        }
        swipeAreaWidth={56}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true
        }}
        anchor="bottom"
        sx={{
          '& .MuiDrawer-paperAnchorBottom': {
            height: '75svh',
            overflowY: 'visible',
            visibility: 'visible !important',
            bgcolor: 'transparent'
          }
        }}
      >
        <Settings />
      </SwipeableDrawer>
    </>
  )
}

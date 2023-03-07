import { ReactElement, useReducer, useState } from 'react'
import Box from '@mui/material/Box'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { Drawer, DRAWER_WIDTH } from '../Drawer'

interface JourneyEditContentState {
  component: string
}

interface JourneyEditContentAction {
  type: string
}

export const reducer = (
  state: JourneyEditContentState,
  action: JourneyEditContentAction
): JourneyEditContentState => {
  switch (action.type) {
    default:
      return {
        ...state,
        component: 'canvas'
      }
  }
}

// This component is tested in Editor
export function JourneyEdit(): ReactElement {
  const [state, dispatch] = useReducer(reducer, { component: 'canvas' })
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 48px)',
          flexDirection: 'column',
          marginRight: { sm: `${DRAWER_WIDTH}px` }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper
          }}
        >
          <Box sx={{ my: 'auto' }}>
            {
              {
                canvas: <Canvas />
              }[state.component]
            }
          </Box>
        </Box>
        <ControlPanel />
      </Box>
      <Drawer />
    </>
  )
}

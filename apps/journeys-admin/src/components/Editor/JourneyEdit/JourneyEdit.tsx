import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { Drawer, DRAWER_WIDTH } from '../Drawer'

// This component is tested in Editor
export function JourneyEdit(): ReactElement {
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
            <Canvas />
          </Box>
        </Box>
        <ControlPanel />
      </Box>
      <Drawer />
    </>
  )
}

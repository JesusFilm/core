import Box from '@mui/material/Box'
import { ReactElement, useEffect } from 'react'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'

import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Content } from '../Slider/Content'
import { JourneyFlow } from '../Slider/JourneyFlow'
import { Settings } from '../Slider/Settings'

/**
 * SinglePageEditor displays JourneyFlow, Content, and Settings components side by side.
 * Used for desktop (md and above) view.
 */
export function SinglePageEditor(): ReactElement {
  // Define fixed widths for components
  const settingsWidth = DRAWER_WIDTH // From constants
  const contentWidth = 375 // Increased width for content to fit card better

  // Access editor state and dispatch to ensure proper content is shown
  const { dispatch } = useEditor()

  // Ensure Canvas is shown in Content component
  useEffect(() => {
    dispatch({
      type: 'SetActiveContentAction',
      activeContent: ActiveContent.Canvas
    })
  }, [dispatch])

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px)`, // Adjust for toolbar height
        overflow: 'hidden',
        p: 4
      }}
    >
      {/* JourneyFlow (takes remaining space) */}
      <Box
        sx={{
          flexGrow: 1, // Takes available space after Content and Settings are sized
          mr: 2,
          borderRadius: 4,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: '#eff2f5',
          overflow: 'hidden',
          minWidth: 0, // Allows the box to shrink below its content size
          height: '100%'
        }}
      >
        <JourneyFlow />
      </Box>

      {/* Content (fixed width) */}
      <Box
        sx={{
          position: 'relative',
          width: `${contentWidth}px`, // Increased width
          height: '100%',
          mr: 2,
          borderRadius: 4,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Content />
        </Box>
      </Box>

      {/* Settings (fixed width) */}
      <Box
        sx={{
          width: `${settingsWidth}px`, // Fixed width
          borderRadius: 4,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: '#fff',
          overflow: 'auto',
          height: '100%'
        }}
      >
        <Settings />
      </Box>
    </Box>
  )
}

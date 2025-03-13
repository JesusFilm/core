import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Content } from '../Slider/Content'
import { JourneyFlow } from '../Slider/JourneyFlow'
import { Settings } from '../Slider/Settings'

export function SinglePageEditor(): ReactElement {
  const {
    state: { activeContent, activeSlide }
  } = useEditor()

  // Determine content width based on activeContent
  const isCanvasContent = activeContent === ActiveContent.Canvas
  const contentMinWidth = isCanvasContent ? '370px' : '900px'

  console.log('activeSlide', activeSlide)
  console.log('activeContent', activeContent)

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        overflow: 'hidden',
        p: 4
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          mr: 2,
          borderRadius: 4,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: '#eff2f5',
          overflow: 'hidden',
          minWidth: 0,
          height: '100%'
        }}
      >
        <JourneyFlow />
      </Box>

      <Box
        sx={{
          position: 'relative',
          minWidth: contentMinWidth,
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

      <Box
        sx={{
          width:
            activeSlide === ActiveSlide.Content ? `${DRAWER_WIDTH}px` : '0px',
          borderRadius: 4,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: '#fff',
          overflow: 'auto',
          height: '100%',
          maxHeight: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 32px)`,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Settings />
      </Box>
    </Box>
  )
}

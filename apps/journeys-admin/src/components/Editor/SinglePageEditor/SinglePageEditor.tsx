import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
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

interface SinglePageEditorProps {
  flowType: 'mobile' | 'desktop'
}

export function SinglePageEditor({
  flowType
}: SinglePageEditorProps): ReactElement {
  const {
    state: { activeContent, activeSlide }
  } = useEditor()

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`,
        overflow: 'hidden',
        p: 4
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          mr: 2,
          borderRadius: 4,
          overflow: 'hidden',
          height: '100%',
          width: '100%'
        }}
      >
        <JourneyFlow flowType={flowType} />
      </Box>

      <Box
        sx={{
          minWidth: activeContent === ActiveContent.Canvas ? '370px' : '900px',
          pt: 2,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Content />
      </Box>

      <Box
        sx={{
          width:
            activeSlide === ActiveSlide.Content ? `${DRAWER_WIDTH}px` : '0px',
          maxHeight: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 32px)`
        }}
      >
        <Settings />
      </Box>
    </Stack>
  )
}

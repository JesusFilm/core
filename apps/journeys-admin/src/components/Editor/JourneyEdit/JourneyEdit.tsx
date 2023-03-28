import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import {
  useEditor,
  ActiveJourneyEditContent
} from '@core/journeys/ui/EditorProvider'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { Drawer, DRAWER_WIDTH } from '../Drawer'
import { SocialPreview } from '../SocialPreview/SocialPreview'

// This component is tested in Editor
export function JourneyEdit(): ReactElement {
  const {
    state: { journeyEditContentComponent }
  } = useEditor()
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
          data-testId="journey-edit-content"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) =>
              journeyEditContentComponent === ActiveJourneyEditContent.Canvas
                ? theme.palette.background.paper
                : theme.palette.background.default
          }}
        >
          <Box sx={{ my: 'auto' }}>
            {
              {
                [ActiveJourneyEditContent.Canvas]: <Canvas />,
                [ActiveJourneyEditContent.SocialPreview]: <SocialPreview />
              }[journeyEditContentComponent]
            }
          </Box>
        </Box>
        <ControlPanel />
      </Box>
      <Drawer />
    </>
  )
}

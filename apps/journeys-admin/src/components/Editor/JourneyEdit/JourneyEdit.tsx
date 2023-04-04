import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import {
  useEditor,
  ActiveJourneyEditContent
} from '@core/journeys/ui/EditorProvider'
import { Theme } from '@mui/system/createTheme'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { Drawer, DRAWER_WIDTH } from '../Drawer'
import { ActionsTable } from '../ActionsTable'
import { SocialPreview } from '../SocialPreview/SocialPreview'

function bgColor(
  theme: Theme,
  view: ActiveJourneyEditContent,
  hasAction: boolean
): string {
  if (
    view === ActiveJourneyEditContent.SocialPreview ||
    (hasAction && view === ActiveJourneyEditContent.Action)
  ) {
    return theme.palette.background.default
  }
  return theme.palette.background.paper
}

// This component is tested in Editor
export function JourneyEdit(): ReactElement {
  const {
    state: { journeyEditContentComponent }
  } = useEditor()
  const [hasAction, setHasAction] = useState(false)

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
              bgColor(theme, journeyEditContentComponent, hasAction)
          }}
        >
          <Box
            sx={{
              my: 'auto'
            }}
          >
            {
              {
                [ActiveJourneyEditContent.Canvas]: <Canvas />,
                [ActiveJourneyEditContent.Action]: (
                  <ActionsTable hasAction={(action) => setHasAction(action)} />
                ),
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

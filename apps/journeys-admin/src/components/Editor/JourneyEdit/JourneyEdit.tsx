import Box from '@mui/material/Box'
import { Theme } from '@mui/system/createTheme'
import { ReactElement, useState } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { ActionsTable } from '../ActionsTable'
import { Canvas } from '../Canvas'
import { ControlPanel } from '../ControlPanel'
import { DRAWER_WIDTH, Drawer } from '../Drawer'
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
        data-testid="JourneyEdit"
      >
        <Box
          data-testid="journey-edit-content"
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
              my: journeyEditContentComponent === 'action' ? 5 : 'auto'
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

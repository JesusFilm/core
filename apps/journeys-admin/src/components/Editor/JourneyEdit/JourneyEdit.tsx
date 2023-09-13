import Stack from '@mui/material/Stack'
import { Theme } from '@mui/system/createTheme'
import { ReactElement, useState } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { usePageWrapperStyles } from '../../NewPageWrapper/utils/usePageWrapperStyles'
import { ActionsTable } from '../ActionsTable'
import { Canvas } from '../Canvas'
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
  const { toolbar, bottomPanel } = usePageWrapperStyles()

  return (
    <Stack
      data-testid="journey-edit-content"
      flexGrow={1}
      justifyContent="center"
      sx={{
        height: {
          md: `calc(100vh - ${bottomPanel.height} - ${toolbar.height})`
        },
        backgroundColor: (theme) =>
          bgColor(theme, journeyEditContentComponent, hasAction)
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
    </Stack>
  )
}

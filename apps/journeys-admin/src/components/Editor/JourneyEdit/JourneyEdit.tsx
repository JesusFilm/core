import Box from '@mui/material/Box'
import { Theme } from '@mui/system/createTheme'
import { ReactElement, useState } from 'react'

import {
  ActiveFab,
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { CardPreview, OnSelectProps } from '../../CardPreview'
import { ActionsTable } from '../ActionsTable'
import { Canvas } from '../Canvas'
import { ContextEditActions } from '../ContextEditActions'
import { ControlPanel } from '../ControlPanel'
import { DRAWER_WIDTH, Drawer } from '../Drawer'
import { SocialShareAppearance } from '../Drawer/SocialShareAppearance'
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
export function 
JourneyEdit(): ReactElement {

  const {
    state: {
      steps,
      selectedBlock,
      selectedComponent,
      selectedStep,
      activeTab,
      journeyEditContentComponent
    },
    dispatch
  } = useEditor()
  

  const selected = selectedComponent ?? selectedBlock ?? 'none'

  const [hasAction, setHasAction] = useState(false)


  const handleSelectStepPreview = ({ step, view }: OnSelectProps): void => {
    if (step != null) {
      dispatch({ type: 'SetSelectedStepAction', step })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    } else if (view === ActiveJourneyEditContent.Action) {
      dispatch({
        type: 'SetJourneyEditContentAction',
        component: ActiveJourneyEditContent.Action
      })
    } else if (view === ActiveJourneyEditContent.SocialPreview) {
      dispatch({
        type: 'SetJourneyEditContentAction',
        component: ActiveJourneyEditContent.SocialPreview
      })
      dispatch({
        type: 'SetDrawerPropsAction',
        title: 'Social Share Preview',
        mobileOpen: false,
        children: <SocialShareAppearance />
      })
    }
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: 'calc(100vh - 48px)',
          flexDirection: 'column',
          // marginRight: { sm: `${DRAWER_WIDTH}px` }
        }}
      >
        <ContextEditActions />
        <CardPreview
          selected={selectedStep}
          onSelect={handleSelectStepPreview}
          steps={steps}
          showAddButton
          showNavigationCards
          isDraggable
        />
        <Box
          data-testid="journey-edit-content"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            // backgroundColor: (theme) =>
            //   bgColor(theme, journeyEditContentComponent, hasAction)
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
        <Drawer />
        {/* <ControlPanel /> */}
      </Box>
    </>
  )
}

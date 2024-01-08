import Stack from '@mui/material/Stack'
import { Theme } from '@mui/system/createTheme'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import {
  ActiveFab,
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'

import { usePageWrapperStyles } from '../../PageWrapper/utils/usePageWrapperStyles'
import { Canvas } from '../Canvas'

const ActionsTable = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ActionsTable" */
      '../ActionsTable'
    ).then((mod) => mod.ActionsTable),
  { ssr: false }
)
const SocialPreview = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/SocialPreview" */
      '../SocialPreview'
    ).then((mod) => mod.SocialPreview),
  { ssr: false }
)

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
  const { toolbar, bottomPanel } = usePageWrapperStyles()

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

  // console.log({ journeyEditContentComponent })
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

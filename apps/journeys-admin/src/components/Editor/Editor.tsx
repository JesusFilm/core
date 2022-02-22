import { ReactElement } from 'react'
import { transformer, TreeBlock, EditorProvider } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { JourneyProvider } from '../../libs/context'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { Drawer, DRAWER_WIDTH } from './Drawer'
import { SocialShareAppearance } from './Drawer/SocialShareAppearance'

interface EditorProps {
  journey: Journey
  selectedStepId?: string
}

export function Editor({ journey, selectedStepId }: EditorProps): ReactElement {
  const steps = transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>
  const selectedStep =
    selectedStepId != null
      ? steps.find(({ id }) => id === selectedStepId)
      : undefined

  return (
    <JourneyProvider value={journey}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          drawerTitle: 'Social Share Appearance',
          drawerChildren: <SocialShareAppearance id={journey.id} />
        }}
      >
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
      </EditorProvider>
    </JourneyProvider>
  )
}

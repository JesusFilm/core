import { ReactElement } from 'react'
import { transformer, TreeBlock, EditorProvider } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import { GetJourneyForEdit_journey as Journey } from '../../../__generated__/GetJourneyForEdit'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { JourneyProvider } from '../../libs/Context'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { TopBar } from './TopBar'
import { Drawer, DRAWER_WIDTH } from './Drawer'
import { SocialShareAppearance } from './Drawer/SocialShareAppearance'

interface EditorProps {
  journey: Journey
}

export function Editor({ journey }: EditorProps): ReactElement {
  const steps = transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>

  return (
    <JourneyProvider value={journey}>
      <EditorProvider
        initialState={{
          steps,
          drawerTitle: 'Social Share Appearance',
          drawerChildren: <SocialShareAppearance id={journey.id} />
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: '100vh',
            flexDirection: 'column',
            marginRight: { sm: `${DRAWER_WIDTH}px` }
          }}
        >
          <TopBar title={journey.title} slug={journey.slug} />
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

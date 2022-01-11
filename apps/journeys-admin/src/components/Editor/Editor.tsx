import { GetJourneyForEdit_journey as Journey } from '../../../__generated__/GetJourneyForEdit'
import { ReactElement } from 'react'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { TopBar } from './TopBar'
import { transformer, TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { EditorProvider } from './Context'
import { Drawer, DRAWER_WIDTH } from './Drawer'
import { Box, Button } from '@mui/material'
import AddRounded from '@mui/icons-material/AddRounded'
import { SocialShareAppearance } from './Drawer/SocialShareAppearance'

interface EditorProps {
  journey: Journey
}

export function Editor({ journey }: EditorProps): ReactElement {
  const steps = transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>

  return (
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
            backgroundColor: (theme) => theme.palette.background.paper,
            position: 'relative'
          }}
        >
          <Box sx={{ my: 'auto' }}>
            <Canvas />
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRounded />}
            sx={{
              position: 'absolute',
              zIndex: 'modal',
              width: '105px',
              height: '48px',
              boxShadow: 5,
              right: 10,
              bottom: 15
            }}
          >
            ADD
          </Button>
        </Box>
        <ControlPanel />
      </Box>
      <Drawer />
    </EditorProvider >
  )
}

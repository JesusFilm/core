import { GetJourneyForEdit_journey as Journey } from '../../../__generated__/GetJourneyForEdit'
import { ReactElement } from 'react'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { TopBar } from './TopBar'
import { transformer, TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { EditorProvider } from './Context'
import { Drawer, DRAWER_WIDTH } from './Drawer'
import { Box } from '@mui/material'

interface EditorProps {
  journey: Journey
}

export function Editor({ journey }: EditorProps): ReactElement {
  const steps = transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>

  return (
    <>
      <EditorProvider initialState={{ steps }}>
        <TopBar title={journey.title} slug={journey.slug} />
        <Box sx={{ marginRight: { sm: `${DRAWER_WIDTH}px` } }}>
          <Canvas />
          <ControlPanel />
        </Box>
        <Drawer />
      </EditorProvider>
    </>
  )
}

import { GetJourneyForEdit_journey as Journey } from '../../../__generated__/GetJourneyForEdit'
import { ReactElement } from 'react'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { TopBar } from './TopBar'
import { transformer, TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { Provider } from './Context'

interface EditorProps {
  journey: Journey
}

export function Editor({ journey }: EditorProps): ReactElement {
  const steps = transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>

  return (
    <>
      <Provider
        initialState={{
          steps,
          selectedStep: steps[0],
          selectedBlock: steps[0]
        }}
      >
        <TopBar title={journey.title} slug={journey.slug} />
        <Canvas />
        <ControlPanel />
      </Provider>
    </>
  )
}

import { GetJourneyForEdit_journey as Journey } from '../../../__generated__/GetJourneyForEdit'
import { ReactElement, useState } from 'react'
import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { TopBar } from './TopBar'
import { transformer, TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'

interface EditorProps {
  journey: Journey
}

export function Editor({ journey }: EditorProps): ReactElement {
  const steps = transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>
  const [selectedStep, setSelectedStep] = useState<TreeBlock<StepBlock>>(
    steps[0]
  )

  return (
    <>
      <TopBar title={journey.title} slug={journey.slug} />
      <Canvas
        onSelect={setSelectedStep}
        selected={selectedStep}
        steps={steps}
      />
      <ControlPanel
        onSelectStep={setSelectedStep}
        selectedStep={selectedStep}
        steps={steps}
      />
    </>
  )
}

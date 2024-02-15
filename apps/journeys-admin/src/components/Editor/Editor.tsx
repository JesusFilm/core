import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { ActiveContent, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

import { Fab } from './Fab'
import { Slider } from './Slider'
import { EditToolbar } from './Toolbar'

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  view?: ActiveContent
}

export function Editor({
  journey,
  selectedStepId,
  view
}: EditorProps): ReactElement {
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined
  const selectedStep =
    selectedStepId != null && steps != null
      ? steps.find(({ id }) => id === selectedStepId)
      : undefined

  return (
    <JourneyProvider value={{ journey, variant: 'admin' }}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          activeContent: view ?? ActiveContent.Canvas
        }}
      >
        <EditToolbar />
        <Slider />
        <Fab />
      </EditorProvider>
    </JourneyProvider>
  )
}

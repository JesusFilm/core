import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

import { Fab } from './Fab'
import { Slider } from './Slider'
import { Toolbar } from './Toolbar'
import { usePlausibleStatsBreakdownQuery } from '../../libs/usePlausibleStatsBreakdownQuery'
import { IdType } from '../../../__generated__/globalTypes'

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  initialState?: Partial<EditorState>
}

/**
 * Editor initializes the journey provider and editor provider states which all
 * descendants are able to make use of via useJourney and useEditor
 * respectively.
 */
export function Editor({
  journey,
  selectedStepId,
  initialState
}: EditorProps): ReactElement {
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined
  const selectedStep =
    selectedStepId != null && steps != null
      ? steps.find(({ id }) => id === selectedStepId)
      : undefined

  const { data } = usePlausibleStatsBreakdownQuery({
    id: journey!.id,
    where: { property: 'event:page' },
    idType: IdType.databaseId
  })

  return (
    <JourneyProvider value={{ journey, variant: 'admin' }}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          journeyStatsBreakdown: data?.journeysPlausibleStatsBreakdown ?? [],
          ...initialState
        }}
      >
        <Toolbar />
        <Slider />
        <Fab variant="mobile" />
      </EditorProvider>
    </JourneyProvider>
  )
}

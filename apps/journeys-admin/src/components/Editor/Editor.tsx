import { ReactElement } from 'react'

import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { transformPlausibleBreakdown } from '@core/journeys/ui/transformPlausibleBreakdown'
import { transformer } from '@core/journeys/ui/transformer'
import formatISO from 'date-fns/formatISO'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { IdType } from '../../../__generated__/globalTypes'
import { useJourneyPlausibleStatsBreakdownQuery } from '../../libs/useJourneyPlausibleStatsBreakdownQuery'

import { usePlausibleLocal } from '../PlausibleLocalProvider'
import { Fab } from './Fab'
import { Slider } from './Slider'
import { Toolbar } from './Toolbar'

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
  const {
    state: { period, date }
  } = usePlausibleLocal()
  const { data } = useJourneyPlausibleStatsBreakdownQuery({
    id: journey?.id ?? '',
    idType: IdType.databaseId,
    period,
    date: formatISO(date, { representation: 'date' })
  })

  const journeyStatsBreakdown = transformPlausibleBreakdown({
    journeyId: journey?.id,
    data
  })

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
          journeyStatsBreakdown,
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

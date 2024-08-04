import type { ReactElement } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'
import type { User } from 'next-firebase-auth'
import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, type  EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import type { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import type { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { Fab } from './Fab'
import { Hotkeys } from './Hotkeys'
import { Slider } from './Slider'
import { Toolbar } from './Toolbar'

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  initialState?: Partial<EditorState>
  user?: User
}

/**
 * Editor initializes the journey provider and editor provider states which all
 * descendants are able to make use of via useJourney and useEditor
 * respectively.
 */
export function Editor({
  journey,
  selectedStepId,
  initialState,
  user
}: EditorProps): ReactElement {
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined
  const selectedStep =
    selectedStepId != null && steps != null
      ? steps.find(({ id }) => id === selectedStepId)
      : undefined
  const { commands } = useFlags()

  return (
    <JourneyProvider value={{ journey, variant: 'admin' }}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          ...initialState
        }}
      >
        <HotkeysProvider>
          {commands && <Hotkeys />}
          <Toolbar user={user} />
          <Slider />
          <Fab variant="mobile" />
        </HotkeysProvider>
      </EditorProvider>
    </JourneyProvider>
  )
}

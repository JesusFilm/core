import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

import { Fab } from './Fab'
import { Hotkeys } from './Hotkeys'
import { SinglePageEditor } from './SinglePageEditor/SinglePageEditor'
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
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
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
          ...initialState
        }}
      >
        <HotkeysProvider>
          <Hotkeys />
          <Toolbar user={user} />
          {smDown ? (
            <Slider flowType="mobile" />
          ) : (
            <SinglePageEditor flowType="desktop" />
          )}
          <Fab variant="mobile" />
        </HotkeysProvider>
      </EditorProvider>
    </JourneyProvider>
  )
}

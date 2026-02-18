import { User } from 'next-firebase-auth'
import { ReactElement, useState } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { MuxVideoUploadProvider } from '../MuxVideoUploadProvider'

import { Fab } from './Fab'
import { FontLoader } from './FontLoader/FontLoader'
import { Hotkeys } from './Hotkeys'
import { Slider } from './Slider'
import { Toolbar } from './Toolbar'
import ToggleButton from '@mui/material/ToggleButton'
import { LayeredView } from './LayeredView'

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
  const [newFlow, setNewFlow] = useState(true)
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
        <MuxVideoUploadProvider>
          <HotkeysProvider>
            <FontLoader
              fonts={[
                journey?.journeyTheme?.headerFont ?? '',
                journey?.journeyTheme?.bodyFont ?? '',
                journey?.journeyTheme?.labelFont ?? ''
              ]}
            />
            <Hotkeys />
            <Toolbar user={user} />
            {/* <ToggleButton value={newFlow} onChange={() => setNewFlow(!newFlow)}>
              {newFlow ? 'New Flow' : 'Old Flow'}
            </ToggleButton>
            {newFlow ? <LayeredView /> : <Slider />} */}
            <LayeredView />
            <Fab variant="mobile" />
          </HotkeysProvider>
        </MuxVideoUploadProvider>
      </EditorProvider>
    </JourneyProvider>
  )
}

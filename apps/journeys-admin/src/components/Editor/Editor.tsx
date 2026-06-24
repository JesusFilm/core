import type { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { User } from '../../libs/auth'
import { MuxVideoUploadProvider } from '../MuxVideoUploadProvider'

import { EditorLayoutProvider } from './EditorLayoutContext'
import { Fab } from './Fab'
import { FontLoader } from './FontLoader/FontLoader'
import { Hotkeys } from './Hotkeys'
import { LayeredView } from './LayeredView'
import { Slider } from './Slider'
import { Toolbar } from './Toolbar'

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  initialState?: Partial<EditorState>
  user?: User | null
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
  // noSsr defers the match to the client so the editor renders the correct
  // surface on first paint instead of mounting <Slider /> then remounting
  // <LayeredView /> (which would flash and remount React Flow) on desktop
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), {
    noSsr: true
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
          ...initialState
        }}
      >
        <MuxVideoUploadProvider>
          <HotkeysProvider>
            <EditorLayoutProvider value={mdUp ? 'layered' : 'slider'}>
              <FontLoader
                fonts={[
                  journey?.journeyTheme?.headerFont ?? '',
                  journey?.journeyTheme?.bodyFont ?? '',
                  journey?.journeyTheme?.labelFont ?? ''
                ]}
              />
              <Hotkeys />
              <Toolbar user={user} />
              {mdUp ? <LayeredView /> : <Slider />}
              <Fab variant="mobile" />
            </EditorLayoutProvider>
          </HotkeysProvider>
        </MuxVideoUploadProvider>
      </EditorProvider>
    </JourneyProvider>
  )
}

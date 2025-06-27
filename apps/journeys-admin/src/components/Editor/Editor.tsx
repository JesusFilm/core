import dynamic from 'next/dynamic'
import { User } from 'next-firebase-auth'
import { ReactElement, useMemo } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider, EditorState } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

import { Fab } from './Fab'
import { Hotkeys } from './Hotkeys'
import { Slider } from './Slider'
import { Toolbar } from './Toolbar'

const FontLoader = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/FontLoader" */ './FontLoader/FontLoader'
    ).then((mod) => mod.FontLoader),
  { ssr: false }
)

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

  const fontFamilies = useMemo(
    () =>
      journey?.journeyTheme
        ? [
            ...new Set([
              journey.journeyTheme.headerFont,
              journey.journeyTheme.bodyFont,
              journey.journeyTheme.labelFont
            ])
          ]
            .filter(Boolean)
            .map(formatFontWithWeights)
        : [],
    [journey]
  )

  function formatFontWithWeights(font: string): string {
    return `${font}:400,500,600,700,800`
  }

  console.log('journey', journey)
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
          <FontLoader fontFamilies={fontFamilies} />
          <Hotkeys />
          <Toolbar user={user} />
          <Slider />
          <Fab variant="mobile" />
        </HotkeysProvider>
      </EditorProvider>
    </JourneyProvider>
  )
}

import { ReactElement, ReactNode } from 'react'
import { transformer } from '@core/journeys/ui/transformer'
import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import {
  ActiveJourneyEditContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { SocialShareAppearance } from './Drawer/SocialShareAppearance'

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  view?: ActiveJourneyEditContent
  children: ReactNode
}

export function Editor({
  journey,
  selectedStepId,
  children,
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
    <JourneyProvider value={{ journey, admin: true }}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          drawerTitle: 'Social Share Appearance',
          drawerChildren: <SocialShareAppearance />,
          journeyEditContentComponent: view ?? ActiveJourneyEditContent.Canvas
        }}
      >
        {children}
      </EditorProvider>
    </JourneyProvider>
  )
}

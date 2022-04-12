import { ReactElement, ReactNode } from 'react'
import { transformer, TreeBlock, EditorProvider } from '@core/journeys/ui'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { JourneyProvider } from '../../libs/context'
import { SocialShareAppearance } from './Drawer/SocialShareAppearance'

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  children: ReactNode
}

export function Editor({
  journey,
  selectedStepId,
  children
}: EditorProps): ReactElement {
  const steps = transformer(journey?.blocks ?? []) as Array<
    TreeBlock<StepBlock>
  >
  const selectedStep =
    selectedStepId != null
      ? steps.find(({ id }) => id === selectedStepId)
      : undefined

  return (
    <JourneyProvider value={journey}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          drawerTitle: 'Social Share Appearance',
          drawerChildren: <SocialShareAppearance />
        }}
      >
        {children}
      </EditorProvider>
    </JourneyProvider>
  )
}

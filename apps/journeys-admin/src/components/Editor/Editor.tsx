import { ReactElement, ReactNode } from 'react'
import {
  transformer,
  TreeBlock,
  EditorProvider,
  JourneyProvider
} from '@core/journeys/ui'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { SocialShareAppearance } from './Drawer/SocialShareAppearance'

interface EditorProps {
  journey?: Journey
  children: ReactNode
}

export function Editor({ journey, children }: EditorProps): ReactElement {
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined

  return (
    <JourneyProvider value={{ journey, admin: true }}>
      <EditorProvider
        initialState={{
          steps,
          drawerTitle: 'Social Share Appearance',
          drawerChildren: <SocialShareAppearance />
        }}
      >
        {children}
      </EditorProvider>
    </JourneyProvider>
  )
}

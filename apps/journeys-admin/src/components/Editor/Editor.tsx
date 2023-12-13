import { ReactElement, ReactNode, useEffect } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

import { Properties } from './Properties'
import { SocialProvider } from './SocialProvider'

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  children: ReactNode
  view?: ActiveJourneyEditContent
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

  useEffect(() => {
    if (window.Beacon != null) {
      window.Beacon('on', 'email-sent', () => {
        window.Beacon?.('session-data', {
          app: 'Next Steps',
          journeyPreview: `${
            process.env.NEXT_PUBLIC_JOURNEYS_URL ?? 'your.nextstep.is'
          }/${journey?.slug as string}`,
          team: journey?.team?.title ?? ''
        })
      })
    }
  }, [journey])

  return (
    <JourneyProvider value={{ journey, variant: 'admin' }}>
      <SocialProvider>
        <EditorProvider
          initialState={{
            steps,
            selectedStep,
            drawerTitle: 'Properties',
            drawerChildren: <Properties isPublisher={false} />,
            journeyEditContentComponent: view ?? ActiveJourneyEditContent.Canvas
          }}
        >
          {children}
        </EditorProvider>
      </SocialProvider>
    </JourneyProvider>
  )
}

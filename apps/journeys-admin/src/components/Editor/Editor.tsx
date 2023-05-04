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
  // const { setValue } = useSocialPreview()
  // useEffect(() => {
  //   setValue?.({ imageSrc: journey?.primaryImageBlock?.src })
  //   console.log(journey?.primaryImageBlock?.src)
  // }, [journey, setValue])

  return (
    <JourneyProvider value={{ journey, admin: true }}>
      <SocialProvider>
        <EditorProvider
          initialState={{
            steps,
            selectedStep,
            drawerTitle: 'Social Share Preview',
            drawerChildren: <SocialShareAppearance />,
            journeyEditContentComponent: view ?? ActiveJourneyEditContent.Canvas
          }}
        >
          {children}
        </EditorProvider>
      </SocialProvider>
    </JourneyProvider>
  )
}

import Stack from '@mui/material/Stack'
import { Theme } from '@mui/system/createTheme'
import dynamic from 'next/dynamic'
import { ComponentProps, ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { PageWrapper } from '../PageWrapper'

import { Canvas } from './Canvas'
import { Properties } from './Properties'

const ActionsTable = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ActionsTable" */
      './ActionsTable'
    ).then((mod) => mod.ActionsTable),
  { ssr: false }
)
const SocialPreview = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/SocialPreview" */
      './SocialPreview'
    ).then((mod) => mod.SocialPreview),
  { ssr: false }
)

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  view?: ActiveJourneyEditContent
  PageWrapperProps?: ComponentProps<typeof PageWrapper>
}

function bgColor(
  theme: Theme,
  view: ActiveJourneyEditContent,
  hasAction: boolean
): string {
  if (
    view === ActiveJourneyEditContent.SocialPreview ||
    (hasAction && view === ActiveJourneyEditContent.Action)
  ) {
    return theme.palette.background.default
  }
  return theme.palette.background.paper
}

export function Editor({
  journey,
  selectedStepId,
  view,
  PageWrapperProps
}: EditorProps): ReactElement {
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined
  const selectedStep =
    selectedStepId != null && steps != null
      ? steps.find(({ id }) => id === selectedStepId)
      : undefined
  const [hasAction, setHasAction] = useState(false)

  return (
    <JourneyProvider value={{ journey, variant: 'admin' }}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          drawerTitle: 'Properties',
          drawerChildren: <Properties isPublisher={false} />,
          journeyEditContentComponent: view ?? ActiveJourneyEditContent.Canvas
        }}
      >
        {({ journeyEditContentComponent }) => (
          <PageWrapper {...PageWrapperProps}>
            <Stack
              data-testid="journey-edit-content"
              flexGrow={1}
              justifyContent="center"
              sx={{
                backgroundColor: (theme) =>
                  bgColor(theme, journeyEditContentComponent, hasAction)
              }}
            >
              {
                {
                  [ActiveJourneyEditContent.Canvas]: <Canvas />,
                  [ActiveJourneyEditContent.Action]: (
                    <ActionsTable
                      hasAction={(action) => setHasAction(action)}
                    />
                  ),
                  [ActiveJourneyEditContent.SocialPreview]: <SocialPreview />
                }[journeyEditContentComponent]
              }
            </Stack>
          </PageWrapper>
        )}
      </EditorProvider>
    </JourneyProvider>
  )
}

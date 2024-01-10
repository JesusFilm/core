import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { Drawer } from './Drawer'
import { EditToolbar } from './EditToolbar'
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
}

export function Editor({
  journey,
  selectedStepId,
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
          <Stack sx={{ height: '100vh' }}>
            <EditToolbar />
            <Stack direction="row" flexGrow={1} sx={{ height: '100%' }}>
              {
                {
                  [ActiveJourneyEditContent.Canvas]: <Canvas />,
                  [ActiveJourneyEditContent.Action]: <ActionsTable />,
                  [ActiveJourneyEditContent.SocialPreview]: <SocialPreview />
                }[journeyEditContentComponent]
              }
              <Drawer />
            </Stack>
            <ControlPanel />
          </Stack>
        )}
      </EditorProvider>
    </JourneyProvider>
  )
}

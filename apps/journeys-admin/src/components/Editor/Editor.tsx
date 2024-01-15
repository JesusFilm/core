import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
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
import { JourneyFlow } from '../JourneyFlow'

import { Canvas } from './Canvas'
import { CardSidebar } from './CardSidebar'
import { ControlPanel } from './ControlPanel'
import { Drawer } from './Drawer'
import { EDIT_TOOLBAR_HEIGHT, EditToolbar } from './EditToolbar'
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
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

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
            <Stack
              direction="row"
              flexGrow={1}
              sx={{ height: `calc(${EDIT_TOOLBAR_HEIGHT}px - 100%)` }}
            >
              {smUp && <CardSidebar />}
              {
                {
                  [ActiveJourneyEditContent.Canvas]: <Canvas />,
                  [ActiveJourneyEditContent.Action]: <ActionsTable />,
                  [ActiveJourneyEditContent.SocialPreview]: <SocialPreview />,
                  [ActiveJourneyEditContent.JourneyFlow]: <JourneyFlow />
                }[journeyEditContentComponent]
              }
              <Drawer />
            </Stack>
            {!smUp && <ControlPanel />}
          </Stack>
        )}
      </EditorProvider>
    </JourneyProvider>
  )
}

import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { ActionItem } from './ActionItem'
import { JourneyFlowItem } from './JourneyFlowItem'
import { SocialPreviewItem } from './SocialPreviewItem'
import { StepItem } from './StepItem'

export function CardSidebar(): ReactElement {
  const {
    state: { steps }
  } = useEditor()

  return (
    <>
      <Stack
        spacing={2}
        sx={{ width: 150, p: 3, overflow: 'auto', flexShrink: 0 }}
      >
        <ActionItem />
        <SocialPreviewItem />
        <JourneyFlowItem />
        {steps?.map((step, index) => (
          <StepItem step={step} key={step.id} index={index} />
        ))}
      </Stack>
      <Divider orientation="vertical" />
    </>
  )
}

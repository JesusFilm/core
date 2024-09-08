import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { ReactElement, useMemo } from 'react'
import { NodeProps } from 'reactflow'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BaseNode, HandleVariant } from '../BaseNode'
import { ActionButton } from '../StepBlockNode/ActionButton'
import { STEP_NODE_WIDTH } from '../StepBlockNode/libs/sizes'
import { StepBlockNodeCard } from '../StepBlockNode/StepBlockNodeCard'

export function MenuNode({
  id,
  xPos,
  yPos,
  dragging,
  data
}: NodeProps): ReactElement {
  const {
    state: { activeContent, selectedStep, steps }
  } = useEditor()

  const step = steps?.find((step) => step.id === id)

  const actionBlocks = useMemo(
    () => (step != null ? filterActionBlocks(step) : []),
    [step]
  )

  const isSelected =
    activeContent === ActiveContent.Canvas && selectedStep?.id === step?.id

  console.log('menuNode', {
    step,
    steps,
    id,
    data,
    actionBlocks
  })
  return (
    <Stack
      // data-testid={`StepBlockNode-${step.id}`}
      direction="column"
      sx={{
        background: (theme) =>
          isSelected
            ? alpha(theme.palette.secondary.dark, 0.095)
            : alpha(theme.palette.background.default, 0.064),
        border: (theme) =>
          `2px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
        borderRadius: 3,
        maxWidth: STEP_NODE_WIDTH,
        transition: (theme) => theme.transitions.create('background')
      }}
    >
      <BaseNode
        id={id}
        selected={activeContent === ActiveContent.Canvas}
        targetHandle={HandleVariant.Hidden}
        sourceHandle={HandleVariant.Hidden}
      >
        <StepBlockNodeCard step={step} selected={isSelected} />
      </BaseNode>
      <Stack>
        {actionBlocks.map((block) => (
          <ActionButton
            key={block.id}
            stepId={step?.id}
            block={block}
            selected={isSelected}
          />
        ))}
      </Stack>
    </Stack>
  )
}

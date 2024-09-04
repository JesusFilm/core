import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { ReactElement, useMemo } from 'react'
import { NodeProps } from 'reactflow'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'

import { BaseNode, HandleVariant } from '../BaseNode'

import { ActionButton } from './ActionButton'
import { STEP_NODE_WIDTH } from './libs/sizes'
import { StepBlockNodeAnalytics } from './StepBlockNodeAnalytics'
import { StepBlockNodeCard } from './StepBlockNodeCard'
import { StepBlockNodeMenu } from './StepBlockNodeMenu'

export function StepBlockNode({
  id,
  xPos,
  yPos,
  dragging
}: NodeProps): ReactElement {
  const {
    state: { steps, importedSteps, selectedStep, activeContent, showAnalytics }
  } = useEditor()
  const step =
    importedSteps?.find((step) => step.id === id) ??
    steps?.find((step) => step.id === id)

  const actionBlocks = useMemo(
    () => (step != null ? [step, ...filterActionBlocks(step)] : []),
    [step]
  )

  const isSelected =
    activeContent === ActiveContent.Canvas && selectedStep?.id === step?.id

  return step != null ? (
    <Stack sx={{ position: 'relative' }}>
      <Fade in={showAnalytics === true}>
        <div>
          <StepBlockNodeAnalytics stepId={step.id} />
        </div>
      </Fade>
      {showAnalytics !== true && importedSteps == null && (
        <StepBlockNodeMenu
          in={isSelected}
          className="fab"
          step={step}
          xPos={xPos}
          yPos={yPos}
        />
      )}
      <Stack
        data-testid={`StepBlockNode-${step.id}`}
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
          id={step.id}
          targetHandle={
            showAnalytics === true || importedSteps != null
              ? HandleVariant.Disabled
              : HandleVariant.Shown
          }
          selected={isSelected}
          isSourceConnected={step.nextBlockId != null}
          dragging={dragging}
        >
          {() => <StepBlockNodeCard step={step} selected={isSelected} />}
        </BaseNode>
        <Stack direction="column" sx={{}}>
          {actionBlocks.map((block) => (
            <ActionButton
              key={block.id}
              stepId={step.id}
              block={block}
              selected={isSelected}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  ) : (
    <></>
  )
}

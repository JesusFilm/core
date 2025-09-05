import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { ReactElement } from 'react'
import { NodeProps, useUpdateNodeInternals } from 'reactflow'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

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
    state: { steps, selectedStep, activeContent, showAnalytics, hoveredStep },
    dispatch
  } = useEditor()
  const { journey } = useJourney()

  const updateNodeInternals = useUpdateNodeInternals()

  const step = steps?.find((step) => step.id === id)
  const actionBlocks = filterActionBlocks(step)
  updateNodeInternals(step?.id ?? '')

  const isSelected =
    activeContent === ActiveContent.Canvas && selectedStep?.id === step?.id

  const isHovered = hoveredStep?.id === step?.id

  const isMenuCard = journey?.menuStepBlock?.id === id

  const targetHandleVariant = isMenuCard
    ? HandleVariant.None
    : showAnalytics === true
      ? HandleVariant.Disabled
      : HandleVariant.Shown

  function handleMouseEnter() {
    dispatch({
      type: 'SetHoveredStepAction',
      hoveredStep: step
    })
  }
  function handleMouseLeave() {
    dispatch({
      type: 'SetHoveredStepAction',
      hoveredStep: undefined
    })
  }

  return step != null ? (
    <Stack sx={{ position: 'relative' }}>
      <Fade in={showAnalytics === true}>
        <div>
          <StepBlockNodeAnalytics stepId={step.id} />
        </div>
      </Fade>
      <Stack
        data-testid={`StepBlockNode-${step.id}`}
        direction="column"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          background: (theme) =>
            isSelected
              ? alpha(theme.palette.secondary.dark, 0.095)
              : alpha(theme.palette.background.default, 0.064),
          border: (theme) =>
            `2px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          borderRadius: 3,
          maxWidth: STEP_NODE_WIDTH,
          transition: (theme) => theme.transitions.create('background'),
          position: 'relative'
        }}
      >
        {showAnalytics !== true && (
          <StepBlockNodeMenu
            in={isSelected || isHovered}
            className="fab"
            step={step}
            xPos={xPos}
            yPos={yPos}
          />
        )}
        <BaseNode
          id={step.id}
          targetHandle={targetHandleVariant}
          selected={isSelected}
          isSourceConnected={step.nextBlockId != null}
          dragging={dragging}
        >
          {() => <StepBlockNodeCard step={step} selected={isSelected} />}
        </BaseNode>
        <Stack direction="column">
          {journey?.website !== true && (
            <ActionButton stepId={step.id} block={step} selected={isSelected} />
          )}
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

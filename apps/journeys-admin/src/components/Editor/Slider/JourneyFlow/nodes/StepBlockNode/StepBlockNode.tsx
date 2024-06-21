import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import { ReactElement, useMemo } from 'react'
import { NodeProps } from 'reactflow'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'

import { BaseNode } from '../BaseNode'

import { ActionButton } from './ActionButton'
import { StepBlockNodeAnalytics } from './StepBlockNodeAnalytics'
import { StepBlockNodeCard } from './StepBlockNodeCard'
import { StepBlockNodeMenu } from './StepBlockNodeMenu'
import { STEP_NODE_WIDTH } from './libs/sizes'

export function StepBlockNode({
  id,
  xPos,
  yPos,
  dragging
}: NodeProps): ReactElement {
  const {
    state: {
      steps,
      selectedStep,
      activeContent,
      showJourneyFlowAnalytics,
      journeyStatsBreakdown
    }
  } = useEditor()
  const step = steps?.find((step) => step.id === id)

  const stats = journeyStatsBreakdown?.stepsStats.find(
    (step) => step.stepId === id
  )
  const actionBlocks = useMemo(
    () => (step != null ? [step, ...filterActionBlocks(step)] : []),
    [step]
  )

  const blockAnalyticsMap = {}

  // const { blockAnalyticsMap } = useMemo(() => {
  //   return getStepAnalytics(actionBlocks, journeyStatsBreakdown?.actionEventMap)
  // }, [actionBlocks, journeyStatsBreakdown?.actionEventMap])

  const isSelected =
    activeContent === ActiveContent.Canvas && selectedStep?.id === step?.id

  return step != null ? (
    <Stack sx={{ position: 'relative' }}>
      <Fade in={showJourneyFlowAnalytics}>
        <div>
          <StepBlockNodeAnalytics {...stats} />
        </div>
      </Fade>
      {!showJourneyFlowAnalytics && (
        <StepBlockNodeMenu
          in={isSelected}
          className="fab"
          step={step}
          xPos={xPos}
          yPos={yPos}
        />
      )}
      {/* <div style={{ position: 'relative' }}> */}
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
          // overflow: 'hidden'
          // boxSizing: 'border-box'
        }}
      >
        <BaseNode
          id={step.id}
          targetHandle={showJourneyFlowAnalytics ? 'disabled' : 'show'}
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
              block={block}
              selected={isSelected}
              analytics={blockAnalyticsMap[block.id]}
            />
          ))}
        </Stack>
      </Stack>
      {/* </div> */}
    </Stack>
  ) : (
    <></>
  )
}

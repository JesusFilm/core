import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'

import { filterActionBlocks } from '../../libs/filterActionBlocks'
import { BaseNode } from '../BaseNode'

import { ActionButton } from './ActionButton'
import { STEP_NODE_WIDTH } from './libs/sizes'
import { StepBlockNodeCard } from './StepBlockNodeCard'
import { StepBlockNodeMenu } from './StepBlockNodeMenu'

export function StepBlockNode({
  id,
  xPos,
  yPos,
  dragging
}: NodeProps): ReactElement {
  const {
    state: { steps, selectedStep, activeContent }
  } = useEditor()
  const step = steps?.find((step) => step.id === id)
  const actionBlocks = filterActionBlocks(step)

  const isSelected =
    activeContent === ActiveContent.Canvas && selectedStep?.id === step?.id

  return step != null ? (
    <>
      {isSelected && (
        <StepBlockNodeMenu
          className="fab"
          step={step}
          xPos={xPos}
          yPos={yPos}
        />
      )}
      <Stack
        gap={0.5}
        direction="column"
        sx={{
          background: (theme) =>
            isSelected
              ? `${theme.palette.secondary.dark}18`
              : `${theme.palette.background.default}10`,
          border: (theme) => `2px solid ${theme.palette.secondary.dark}0D`,
          borderRadius: 3,
          maxWidth: STEP_NODE_WIDTH
        }}
      >
        <BaseNode
          id={step.id}
          isTargetConnectable
          selected={isSelected}
          isSourceConnected={step.nextBlockId != null}
          dragging={dragging}
        >
          {() => (
            <>
              <StepBlockNodeCard step={step} selected={isSelected} />
              <ActionButton block={step} selected={isSelected} />
            </>
          )}
        </BaseNode>
        <Stack direction="column">
          {actionBlocks.map((block) => (
            <ActionButton key={block.id} block={block} selected={isSelected} />
          ))}
        </Stack>
      </Stack>
    </>
  ) : (
    <></>
  )
}

import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { NodeProps, OnConnect } from 'reactflow'

import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
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
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const { journey } = useJourney()

  async function handleSourceConnect(
    params: { target: string; source: string } | Parameters<OnConnect>[0]
  ): Promise<void> {
    const targetId = params.target
    const sourceId = params.source
    if (journey == null || targetId == null || sourceId == null) return

    await stepBlockNextBlockUpdate({
      variables: {
        id: sourceId,
        journeyId: journey.id,
        input: {
          nextBlockId: targetId
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id,
          __typename: 'StepBlock',
          nextBlockId: targetId
        }
      }
    })
  }

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
              ? `${theme.palette.secondary.dark}20`
              : `${theme.palette.divider}80`,
          // border: (theme) => `2px solid ${theme.palette.secondary.dark}0D`,
          borderRadius: 3,
          maxWidth: STEP_NODE_WIDTH
        }}
      >
        <BaseNode
          id={step.id}
          isTargetConnectable
          selected={isSelected}
          onSourceConnect={handleSourceConnect}
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

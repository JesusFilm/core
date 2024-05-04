import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { NodeProps, OnConnect } from 'reactflow'

import {
  ActiveContent,
  ActiveFab,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { filterActionBlocks } from '../../libs/filterActionBlocks'
import { BaseNode } from '../BaseNode'

import { ActionButton } from './ActionButton'
import { StepBlockNodeMenu } from './StepBlockNodeMenu'
import { StepBlockNodeCard } from './StepBlockNodeCard'

export const STEP_NODE_WIDTH = 200
export const STEP_NODE_HEIGHT = 76
export const STEP_NODE_WIDTH_GAP = 200
export const STEP_NODE_HEIGHT_GAP = 150

export function StepBlockNode({ id, xPos, yPos }: NodeProps): ReactElement {
  const {
    state: { steps, selectedStep, activeContent },
    dispatch
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

  function handleClick(): void {
    if (selectedStep?.id === step?.id) {
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
      })
    } else {
      dispatch({ type: 'SetSelectedStepAction', selectedStep: step })
    }
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
        onClick={handleClick}
        sx={{
          background:
            activeContent === ActiveContent.Canvas &&
            selectedStep?.id === step.id
              ? 'rgba(0, 0, 0, .05)'
              : 'rgba(240, 242, 245, .5)',
          border: '2px solid rgba(0,0,0, .05)',
          borderRadius: 3
        }}
      >
        <BaseNode
          id={step.id}
          isTargetConnectable
          selected={isSelected}
          onSourceConnect={handleSourceConnect}
        >
          {({ selected }) => (
            <StepBlockNodeCard step={step} selected={isSelected} />
          )}
        </BaseNode>
        <Stack direction="column">
          <ActionButton
            block={{
              __typename: 'CustomBlock',
              id: step.id,
              label: 'Next Step →'
            }}
            selected={isSelected}
          />
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

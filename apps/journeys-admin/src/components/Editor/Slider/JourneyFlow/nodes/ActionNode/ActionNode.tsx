import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ComponentProps, ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveContent, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields as Block,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import { useNavigateToBlockActionUpdateMutation } from '../../../../libs/useNavigateToBlockActionUpdateMutation'
import { BaseNode } from '../BaseNode'

export const ACTION_NODE_WIDTH = 125
export const ACTION_NODE_HEIGHT = 28
export const ACTION_NODE_WIDTH_GAP = 11
export const ACTION_NODE_HEIGHT_GAP = 16

export interface ActionNodeProps extends ComponentProps<typeof BaseNode> {
  title: string
  block: TreeBlock<Block>
  step: TreeBlock<StepBlock>
}

export function ActionNode({
  title,
  block,
  step,
  onSourceConnect,
  ...props
}: ActionNodeProps): ReactElement {
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const { journey } = useJourney()
  const {
    state: { selectedBlock, activeContent },
    dispatch
  } = useEditor()

  async function handleSourceConnect(params): Promise<void> {
    if (journey == null) return

    await navigateToBlockActionUpdate(block, params.target)

    onSourceConnect?.(params)
  }

  function handleClick(): void {
    dispatch({ type: 'SetSelectedStepAction', selectedStep: step })
    dispatch({ type: 'SetSelectedBlockAction', selectedBlock: block })
  }

  return (
    <BaseNode
      isSourceConnectable
      onSourceConnect={handleSourceConnect}
      selected={
        activeContent === ActiveContent.Canvas && selectedBlock?.id === block.id
      }
      isTargetConnectable={false}
      {...props}
    >
      {({ selected }) => (
        <Box
          sx={{
            borderRadius: 20,
            outline: (theme) =>
              `1px solid ${
                selected !== false ? theme.palette.primary.main : 'grey'
              }`,
            backgroundColor: '#eff2f5',
            width: ACTION_NODE_WIDTH,
            height: ACTION_NODE_HEIGHT,
            py: 1,
            px: 4
          }}
          onClick={handleClick}
        >
          <Typography
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 10
            }}
            variant="body2"
          >
            {title}
          </Typography>
        </Box>
      )}
    </BaseNode>
  )
}

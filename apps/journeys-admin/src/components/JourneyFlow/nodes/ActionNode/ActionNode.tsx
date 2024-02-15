import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ComponentProps, ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields as Block,
  BlockFields_StepBlock as StepBlock
} from '../../../../../__generated__/BlockFields'
import { useNavigateToBlockActionUpdateMutation } from '../../../../libs/useNavigateToBlockActionUpdateMutation'
import { BaseNode } from '../BaseNode'

export const ACTION_NODE_WIDTH = 100
export const ACTION_NODE_HEIGHT = 24
export const ACTION_NODE_WIDTH_GAP = 12
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
    state: { selectedBlock, journeyEditContentComponent },
    dispatch
  } = useEditor()

  async function handleSourceConnect(params): Promise<void> {
    if (journey == null) return

    await navigateToBlockActionUpdate(block, params.target)

    onSourceConnect?.(params)
  }

  function handleClick(): void {
    dispatch({ type: 'SetSelectedStepAction', step })
    dispatch({ type: 'SetSelectedBlockAction', block })
  }

  return (
    <BaseNode
      isSourceConnectable
      onSourceConnect={handleSourceConnect}
      selected={
        journeyEditContentComponent === ActiveJourneyEditContent.Canvas &&
        selectedBlock?.id === block.id
      }
      isTargetConnectable={false}
      {...props}
    >
      {({ selected }) => (
        <Box
          sx={{
            borderRadius: 20,
            outline: (theme) =>
              `2px solid ${
                selected !== false ? theme.palette.primary.main : 'grey'
              }`,
            backgroundColor: 'rgba(241,241,241,,7)',
            width: ACTION_NODE_WIDTH,
            height: ACTION_NODE_HEIGHT,
            px: 3
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
              fontSize: 10,
              lineHeight: ACTION_NODE_HEIGHT,
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

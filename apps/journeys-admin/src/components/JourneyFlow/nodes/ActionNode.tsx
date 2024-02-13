import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ComponentProps, ReactElement } from 'react'

import {
  ActiveJourneyEditContent,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields } from '../../../../__generated__/BlockFields'
import { useNavigateToBlockActionUpdateMutation } from '../../../libs/useNavigateToBlockActionUpdateMutation'

import { BaseNode } from './BaseNode'

export const ACTION_NODE_WIDTH = 125
export const ACTION_NODE_HEIGHT = 28
export const ACTION_NODE_WIDTH_GAP = 11
export const ACTION_NODE_HEIGHT_GAP = 16

export interface ActionNodeProps extends ComponentProps<typeof BaseNode> {
  title: string
  block: BlockFields
}

export function ActionNode({
  block,
  title,
  onSourceConnect,
  ...props
}: ActionNodeProps): ReactElement {
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const { journey } = useJourney()

  const {
    state: { selectedBlock, journeyEditContentComponent }
  } = useEditor()

  async function handleSourceConnect(params): Promise<void> {
    if (journey == null) return

    await navigateToBlockActionUpdate(block, params.target)

    onSourceConnect?.(params)
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
      <Box
        sx={{
          borderRadius: 20,
          outline: (theme) => `2px solid ${theme.palette.divider}`,
          backgroundColor: '#eff2f5',
          outlineWidth: 1,
          outlineColor: 'grey',
          width: ACTION_NODE_WIDTH,
          height: ACTION_NODE_HEIGHT,
          py: 1,
          px: 4
        }}
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
    </BaseNode>
  )
}

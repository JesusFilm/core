import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  getStraightPath
} from 'reactflow'

import ArrowRightSmIcon from '@core/shared/ui/icons/ArrowRightSm'
import CursorPointerIcon from '@core/shared/ui/icons/CursorPointer'
import GitBranchIcon from '@core/shared/ui/icons/GitBranch'

type AiEdgeVariant = 'default' | 'button' | 'poll'

interface AiViewEdgeData {
  variant: AiEdgeVariant
  label?: string
}

const EDGE_COLORS: Record<AiEdgeVariant, string> = {
  default: '#6D6D7D80',
  button: '#6D6D7D30',
  poll: '#4c9bf880'
}

const EDGE_ICONS: Record<AiEdgeVariant, typeof ArrowRightSmIcon> = {
  default: ArrowRightSmIcon,
  button: CursorPointerIcon,
  poll: GitBranchIcon
}

const DEFAULT_LABELS: Record<AiEdgeVariant, string> = {
  default: 'Default',
  button: 'Button',
  poll: 'Option'
}

function isHorizontal(
  sourceY: number,
  targetY: number,
  threshold = 5
): boolean {
  return Math.abs(sourceY - targetY) < threshold
}

export function AiViewEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd
}: EdgeProps<AiViewEdgeData>): ReactElement {
  const variant: AiEdgeVariant = data?.variant ?? 'default'
  const label = data?.label ?? DEFAULT_LABELS[variant]
  const strokeColor = EDGE_COLORS[variant]
  const Icon = EDGE_ICONS[variant]

  const horizontal = isHorizontal(sourceY, targetY)

  const [edgePath, labelX, labelY] = horizontal
    ? getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY
      })
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
      })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: 2
        }}
      />
      <EdgeLabelRenderer>
        <Box
          data-testid={`AiViewEdge-${id}`}
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 10,
            px: 1,
            py: 0.25
          }}
        >
          <Icon sx={{ fontSize: 12, color: 'text.secondary' }} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              maxWidth: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: 10,
              lineHeight: 1.2
            }}
          >
            {label}
          </Typography>
        </Box>
      </EdgeLabelRenderer>
    </>
  )
}

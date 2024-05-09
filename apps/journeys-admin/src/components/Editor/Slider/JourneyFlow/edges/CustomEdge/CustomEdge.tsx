import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'
import {
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useOnSelectionChange
} from 'reactflow'

import X3Icon from '@core/shared/ui/icons/X3'

import { useDeleteEdge } from '../../libs/useDeleteEdge'
import { BaseEdge } from '../BaseEdge'

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {}
}: EdgeProps): ReactElement {
  const deleteEdge = useDeleteEdge()
  const [edgeSelected, setEdgeSelected] = useState(false)
  const [selectedEdge, setSelectedEdge] = useState<Edge | undefined>(undefined)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  useOnSelectionChange({
    onChange: (selected) => {
      const selectedEdge = selected.edges.find((edge) => edge.id === id)
      if (selectedEdge != null) {
        setSelectedEdge(selectedEdge)
        setEdgeSelected(true)
      } else {
        setEdgeSelected(false)
      }
    }
  })

  const onEdgeClick = (): void => {
    void deleteEdge(selectedEdge?.source, selectedEdge?.sourceHandle)
  }

  return (
    <BaseEdge id={id} style={style} edgePath={edgePath}>
      {edgeSelected && (
        <EdgeLabelRenderer>
          <Box
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all'
            }}
          >
            <IconButton
              onClick={onEdgeClick}
              sx={{
                borderRadius: '100%',
                backgroundColor: (theme) => theme.palette.primary.main,
                height: 4,
                width: 4,
                display: 'flex',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.primary.main,
                  opacity: 0.8
                }
              }}
            >
              <X3Icon
                sx={{
                  height: 12,
                  width: 12,
                  color: (theme) => theme.palette.background.paper
                }}
              />
            </IconButton>
          </Box>
        </EdgeLabelRenderer>
      )}
    </BaseEdge>
  )
}

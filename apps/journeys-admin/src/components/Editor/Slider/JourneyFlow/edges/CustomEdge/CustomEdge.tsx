import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'
import {
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
  source,
  sourceHandleId,
  style = {}
}: EdgeProps): ReactElement {
  const deleteEdge = useDeleteEdge()
  const [selected, setSelected] = useState(false)
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
        setSelected(true)
      } else {
        setSelected(false)
      }
    }
  })

  const onEdgeClick = (): void => {
    void deleteEdge({
      source,
      sourceHandle: sourceHandleId
    })
  }

  return (
    <BaseEdge id={id} style={style} edgePath={edgePath}>
      {selected && (
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
                backgroundColor: 'primary.main',
                height: 4,
                width: 4,
                display: 'flex',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  opacity: 0.8
                }
              }}
            >
              <X3Icon
                sx={{
                  height: 12,
                  width: 12,
                  color: 'background.paper'
                }}
              />
            </IconButton>
          </Box>
        </EdgeLabelRenderer>
      )}
    </BaseEdge>
  )
}

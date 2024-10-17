import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useEffect, useState } from 'react'
import {
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useOnSelectionChange
} from 'reactflow'

import { useEditor } from '@core/journeys/ui/EditorProvider'
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
  style = {},
  isSelected = false // for testing use
}: EdgeProps & { isSelected?: boolean }): ReactElement {
  const {
    state: { showAnalytics, importedSteps }
  } = useEditor()
  const deleteEdge = useDeleteEdge()
  const [selected, setSelected] = useState(isSelected)
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  useEffect(() => {
    if (showAnalytics === true || importedSteps != null) {
      setSelected(false)
    }
  }, [showAnalytics])

  useOnSelectionChange({
    onChange: ({ edges }) => {
      if (showAnalytics === true || importedSteps != null) return
      setSelected(edges.find((edge) => edge.id === id) != null)
    }
  })

  const handleEdgeDelete = (): void => {
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
            sx={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: (theme) => theme.zIndex.modal - 1
            }}
          >
            <IconButton
              onClick={handleEdgeDelete}
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

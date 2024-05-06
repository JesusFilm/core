import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { ReactElement, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useOnSelectionChange
} from 'reactflow'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import X3Icon from '@core/shared/ui/icons/X3'

import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'

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
  const { journey } = useJourney()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()

  const [sourceNodeId, setSourceNodeId] = useState<string | undefined>(
    undefined
  )
  // const [edgeSelected, setEdgeSelected] = useState(false)
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
        setSourceNodeId(selectedEdge.source)
      } else {
        setSourceNodeId(undefined)
      }
    }
  })

  const onEdgeClick = (): void => {
    if (journey == null || sourceNodeId == null) return
    void stepBlockNextBlockUpdate({
      variables: {
        id: sourceNodeId,
        journeyId: journey.id,
        input: {
          nextBlockId: null
        }
      },
      optimisticResponse: {
        stepBlockUpdate: {
          id: sourceNodeId,
          __typename: 'StepBlock',
          nextBlockId: null
        }
      }
    })
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={`url(#1__color=${
          sourceNodeId != null ? '#C52D3A' : 'lightGrey'
        }&height=10&type=arrowclosed&width=10)`}
        style={{
          strokeWidth: 2,
          stroke: sourceNodeId != null ? '#C52D3A' : '#0000001A',
          ...style
        }}
      />
      {sourceNodeId != null && (
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
                backgroundColor: '#C52D3A',
                height: '16px',
                width: '16px',
                display: 'flex',
                '&:hover': {
                  backgroundColor: '#C52D3A',
                  opacity: 0.8
                }
              }}
            >
              <X3Icon sx={{ height: '12px', width: '12px', color: 'white' }} />
            </IconButton>
          </Box>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

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

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import X3Icon from '@core/shared/ui/icons/X3'

import { useBlockActionDeleteMutation } from '../../../../../../libs/useBlockActionDeleteMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
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
  const { journey } = useJourney()
  const {
    state: { steps }
  } = useEditor()

  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const [blockActionDelete] = useBlockActionDeleteMutation()

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
    if (journey == null || selectedEdge == null) return
    const step = steps?.find((step) => step.id === selectedEdge.source)
    if (step == null) return

    if (selectedEdge.sourceHandle != null) {
      // action
      const block = searchBlocks(
        step != null ? [step] : [],
        selectedEdge.sourceHandle
      )
      if (block != null) {
        void blockActionDelete(block)
      }
    } else {
      // step block
      void stepBlockNextBlockUpdate({
        variables: {
          id: step.id,
          journeyId: journey.id,
          input: {
            nextBlockId: null
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: step.id,
            __typename: 'StepBlock',
            nextBlockId: null
          }
        }
      })
    }
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
    </BaseEdge>
  )
}

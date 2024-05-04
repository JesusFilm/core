import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath
} from 'reactflow'

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd
}: EdgeProps): ReactElement {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })

  const onEdgeClick = (params): void => {
    console.log('button clicked! ' + params)
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {/* <EdgeLabelRenderer>
        <Box
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            padding: 0,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          className="nodrag nopan"
        >
          <button
            className="edgebutton"
            onClick={onEdgeClick}
            style={{
              borderRadius: '50%',
              background: 'white',
              borderColor: 'transparent',
              cursor: 'pointer',
              margin: 0,
              padding: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <AddCircleRoundedIcon
              sx={{
                color: '#3aa74a',
                fontSize: 'large',
                padding: 0,
                margin: 0
              }}
            />
          </button>
        </Box>
      </EdgeLabelRenderer> */}
    </>
  )
}

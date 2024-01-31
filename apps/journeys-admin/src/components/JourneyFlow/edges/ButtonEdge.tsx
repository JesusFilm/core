import AddRoundedIcon from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import React, { ReactElement } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath
} from 'reactflow'

// const onEdgeClick = (evt, id): void => {
//   evt.stopPropagation()
//   alert(`remove ${id}`)
// }

export default function CustomEdge({
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
      <EdgeLabelRenderer>
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
              background: '#3aa74a',
              borderColor: 'transparent',
              cursor: 'pointer',
              margin: 0,
              padding: 0,
              width: 18,
              height: 18
            }}
          >
            <AddRoundedIcon
              style={{
                borderRadius: '50%',
                color: 'white',
                fontSize: 'large',
                padding: 0,
                margin: 0
              }}
            />
          </button>
        </Box>
      </EdgeLabelRenderer>
    </>
  )
}

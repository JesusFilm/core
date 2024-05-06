import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useOnSelectionChange,
  useStore
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
  const [edgeColor, setEdgeColor] = useState('#0000001A')
  const [markerEndColor, setMarkerEndColor] = useState('lightGrey')
  // const s = useStore((state) => state)
  // console.log('STATE: ', s)
  // console.log('ID: ', id)
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
      if (selected.edges.find((edge) => edge.id === id) != null) {
        setEdgeColor('#C52D3A')
        setMarkerEndColor('#C52D3A')
      } else {
        setEdgeColor('#0000001A')
        setMarkerEndColor('lightGrey')
      }
    }
  })

  const onEdgeClick = (params): void => {
    console.log('button clicked! ' + params)
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={`url(#1__color=${markerEndColor}&height=10&type=arrowclosed&width=10)`}
        style={{ strokeWidth: 2, stroke: edgeColor, ...style }}
      />
      {/* <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all'
          }}
          className="nodrag nopan"
        >
          <button className="edgebutton" onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer> */}
    </>
  )
}

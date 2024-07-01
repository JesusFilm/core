import { getBezierPath } from 'reactflow'
import { BaseEdge } from '../BaseEdge'

export function ReferrerEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition
}) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  })
  return (
    <BaseEdge id={id} edgePath={edgePath} showMarkerEnd={false} style={{}} />
  )
}

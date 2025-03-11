import type { Edge, Node } from '@xyflow/react'

import { JourneyAnalyticsReferrer } from '../useJourneyAnalyticsQuery'

export function transformReferrers(referrers: JourneyAnalyticsReferrer[]): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = []
  const edges: Edge[] = []

  referrers.forEach((referrer) => {
    const id = `referrer-${referrer.id}`
    nodes.push({
      id,
      type: 'referrer',
      position: { x: 0, y: 0 },
      data: {
        referrer
      }
    })
    edges.push({
      id: `${id}->${referrer.stepId}`,
      source: id,
      target: referrer.stepId,
      type: 'referrer'
    })
  })

  return { nodes, edges }
}

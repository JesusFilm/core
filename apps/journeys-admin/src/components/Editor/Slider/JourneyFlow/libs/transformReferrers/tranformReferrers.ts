import { PlausibleJourneyReferrerFields as PlausibleReferrer } from '@core/journeys/ui/transformPlausibleBreakdown/plausibleFields/__generated__/PlausibleJourneyReferrerFields'
import { Edge, MarkerType, Node } from 'reactflow'
import { MARKER_END_DEFAULT_COLOR } from '../transformSteps'

export function transformReferrers(referrers?: PlausibleReferrer[]) {
  if (referrers == null || referrers.length === 0)
    return { nodes: [], edges: [] }

  return referrers.reduce<{ nodes: Node[]; edges: Edge[] }>(
    (acc, referrer, idx) => {
      const id = `${referrer.property}->SocialPreview`
      const yPos = 64 * idx - 46

      acc.nodes.push({
        id,
        type: 'Referrer',
        data: referrer,
        position: { x: -600, y: yPos },
        draggable: false
      })

      acc.edges.push({
        id,
        source: referrer.property,
        target: 'SocialPreview',
        type: 'Custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          height: 10,
          width: 10,
          color: MARKER_END_DEFAULT_COLOR
        }
      })

      return acc
    },
    { nodes: [], edges: [] }
  )
}

import { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'
import { Edge, Node } from 'reactflow'

const SOCIAL_PREVIEW_CARD_HEIGHT = 168
const START_OF_SOCIAL_PREVIEW = -60

function sortReferrers(a: JourneyReferrer, b: JourneyReferrer) {
  if (a.visitors === null) {
    return 1
  }

  if (b.visitors === null) {
    return -1
  }

  return b.visitors - a.visitors
}

export function transformReferrers(referrers?: JourneyReferrer[]) {
  const nodes: Node[] = []
  const edges: Edge[] = []

  if (referrers == null || referrers.length === 0) return { nodes, edges }

  const sortedReferrers = [...referrers].sort(sortReferrers)

  if (referrers.length > 3) {
    const topReferrers = sortedReferrers.slice(0, 2)
    const otherReferrers = sortedReferrers.slice(2, referrers.length)

    function getYPos(idx: number) {
      return (
        START_OF_SOCIAL_PREVIEW + ((idx + 1) / 4) * SOCIAL_PREVIEW_CARD_HEIGHT
      )
    }

    topReferrers.forEach((referrer, idx) => {
      nodes.push({
        id: referrer.property,
        type: 'Referrer',
        data: referrer,
        position: { x: -600, y: getYPos(idx) },
        draggable: false,
        connectable: false
      })

      edges.push({
        id: `${referrer.property}->SocialPreview`,
        source: referrer.property,
        target: 'SocialPreview',
        type: 'Referrer',
        updatable: false
      })
    })

    nodes.push({
      id: 'Other sources',
      type: 'Referrer',
      data: { property: 'Other sources', referrers: otherReferrers },
      position: { x: -600, y: getYPos(2) },
      draggable: false,
      connectable: false
    })

    edges.push({
      id: 'Other sources->SocialPreview',
      source: 'Other sources',
      target: 'SocialPreview',
      type: 'Referrer',
      updatable: false
    })
  } else {
    sortedReferrers.forEach((referrer, idx) => {
      const yPos =
        -60 + ((idx + 1) / (referrers.length + 1)) * SOCIAL_PREVIEW_CARD_HEIGHT

      nodes.push({
        id: referrer.property,
        type: 'Referrer',
        data: referrer,
        position: { x: -600, y: yPos },
        draggable: false,
        connectable: false
      })

      edges.push({
        id: `${referrer.property}->SocialPreview`,
        source: referrer.property,
        target: 'SocialPreview',
        type: 'Referrer',
        updatable: false
      })
    })
  }

  return { nodes, edges }
}

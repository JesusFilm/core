import type { Edge, Node } from 'reactflow'

import type { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '../__generated__/GetJourneyAnalytics'

interface OtherSource {
  property: 'other sources'
  referrers: JourneyReferrer[]
}

const SOCIAL_PREVIEW_CARD_HEIGHT = 168
const START_OF_SOCIAL_PREVIEW = -46
const REFERRER_NODE_HEIGHT = 38

const THREE_NODE_Y_POSITIONS = [
  START_OF_SOCIAL_PREVIEW,
  START_OF_SOCIAL_PREVIEW +
    SOCIAL_PREVIEW_CARD_HEIGHT / 2 -
    REFERRER_NODE_HEIGHT / 2,
  START_OF_SOCIAL_PREVIEW + SOCIAL_PREVIEW_CARD_HEIGHT - REFERRER_NODE_HEIGHT
]

function sortReferrers(a: JourneyReferrer, b: JourneyReferrer): number {
  if (a.visitors === null) {
    return 1
  }

  if (b.visitors === null) {
    return -1
  }

  return b.visitors - a.visitors
}

export function transformReferrers(referrers?: JourneyReferrer[]): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = []
  const edges: Edge[] = []

  if (referrers == null || referrers.length === 0) return { nodes, edges }

  const sortedReferrers: Array<JourneyReferrer | OtherSource> = [
    ...referrers
  ].sort(sortReferrers)

  if (sortedReferrers.length >= 3) {
    if (sortedReferrers.length > 3) {
      sortedReferrers.splice(2, Number.POSITIVE_INFINITY, {
        property: 'other sources',
        referrers: sortedReferrers.slice(2) as JourneyReferrer[]
      })
    }

    sortedReferrers.forEach((referrer, idx) => {
      nodes.push({
        id: referrer.property,
        type: 'Referrer',
        data: referrer,
        position: { x: -600, y: THREE_NODE_Y_POSITIONS[idx] },
        draggable: false
      })

      edges.push({
        id: `${referrer.property}->SocialPreview`,
        source: referrer.property,
        target: 'SocialPreview',
        type: 'Referrer',
        updatable: false
      })
    })
  } else {
    sortedReferrers.forEach((referrer, idx) => {
      const yPos =
        START_OF_SOCIAL_PREVIEW +
        ((idx + 1) / (referrers.length + 1)) * SOCIAL_PREVIEW_CARD_HEIGHT -
        REFERRER_NODE_HEIGHT / 2

      nodes.push({
        id: referrer.property,
        type: 'Referrer',
        data: referrer,
        position: { x: -600, y: yPos },
        draggable: false
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

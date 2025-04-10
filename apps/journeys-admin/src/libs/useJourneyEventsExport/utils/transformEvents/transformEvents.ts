import { GetJourneyEvents_journeyEventsConnection_edges } from '../../../../../__generated__/GetJourneyEvents'
import { JourneyEvent } from '../../useJourneyEventsExport'

export function transformEvents(
  events: GetJourneyEvents_journeyEventsConnection_edges[]
): JourneyEvent[] {
  return events.map((edge) => {
    switch (edge.node.typename) {
      case 'VideoProgressEvent':
        return {
          ...edge.node,
          value: edge.node.progress?.toString() ?? null
        }
      case 'VideoStartEvent':
        return {
          ...edge.node,
          value: '0'
        }
      case 'VideoCompleteEvent':
        return {
          ...edge.node,
          value: '100'
        }
      default:
        return edge.node
    }
  })
}

import { GetJourneyEvents_journeyEventsConnection_edges as EventEdge } from '../../../../../__generated__/GetJourneyEvents'
import { JourneyEvent } from '../../useJourneyEventsExport'

export function transformEvents(events: EventEdge[]): JourneyEvent[] {
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

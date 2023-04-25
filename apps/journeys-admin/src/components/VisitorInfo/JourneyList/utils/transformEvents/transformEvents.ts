import { forEachRight } from 'lodash'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

export function transformEvents(events: Event[]): Array<Event | Event[]> {
  let result: Array<Event | Event[]> = []
  let pointer = 0
  const featured: Array<Event['__typename']> = [
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'RadioQuestionSubmissionEvent'
  ]

  const compact: Array<Event['__typename']> = [
    'ButtonClickEvent',
    'VideoCompleteEvent',
    'VideoStartEvent',
    'SignUpSubmissionEvent'
  ]

  forEachRight(events, (event) => {
    if (featured.includes(event.__typename)) {
      if (result[pointer] != null) pointer++
      result = [...result, event]
      pointer++
    } else if (compact.includes(event.__typename)) {
      const nestedEvent = result[pointer]
      if (nestedEvent == null) {
        result = [...result, [event]]
      } else if (Array.isArray(nestedEvent)) {
        nestedEvent.push(event)
      }
    }
  })

  return result
}

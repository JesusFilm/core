import { forEachRight } from 'lodash'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

export function transformEvents(events: Event[]): Array<Event | Event[]> {
  let result: Array<Event | Event[]> = []
  let pointer = 0
  const summaryEvents: Array<Event['__typename']> = [
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'RadioQuestionSubmissionEvent'
  ]

  forEachRight(events, (event) => {
    if (summaryEvents.includes(event.__typename)) {
      if (result[pointer] != null) pointer++
      result = [...result, event]
      pointer++
    } else {
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

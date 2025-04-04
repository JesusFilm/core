import { builder } from '../../builder'
import { EventType } from '../enums'

export const JourneyEventsExportLogInput = builder.inputType(
  'JourneyEventsExportLogInput',
  {
    fields: (t) => ({
      journeyId: t.id({ required: true }),
      eventsFilter: t.field({
        type: [EventType],
        required: true
      }),
      dateRangeStart: t.field({ type: 'DateTimeISO', required: false }),
      dateRangeEnd: t.field({ type: 'DateTimeISO', required: false })
    })
  }
)

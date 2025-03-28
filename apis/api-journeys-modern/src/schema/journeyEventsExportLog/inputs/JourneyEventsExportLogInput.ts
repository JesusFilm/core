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
      dateRangeStart: t.string(),
      dateRangeEnd: t.string()
    })
  }
)

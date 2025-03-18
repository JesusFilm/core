import { builder } from '../../builder'

export const JourneyEventsExportLogInput = builder.inputType(
  'JourneyEventsExportLogInput',
  {
    fields: (t) => ({
      journeyId: t.id({ required: true }),
      eventsFilter: t.stringList(),
      dateRangeStart: t.string(),
      dateRangeEnd: t.string()
    })
  }
)

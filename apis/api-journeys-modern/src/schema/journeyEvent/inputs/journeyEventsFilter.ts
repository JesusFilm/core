import { builder } from '../../builder'

export const JourneyEventsFilter = builder.inputType('JourneyEventsFilter', {
  fields: (t) => ({
    typenames: t.stringList({ required: false }),
    periodRangeStart: t.field({ type: 'DateTime', required: false }),
    periodRangeEnd: t.field({ type: 'DateTime', required: false })
  })
})

import { builder } from '../../builder'

export const PlausibleStatsAggregateFilter = builder.inputType(
  'PlausibleStatsAggregateFilter',
  {
    fields: (t) => ({
      period: t.string({ required: false }),
      date: t.string({ required: false }),
      filters: t.string({ required: false }),
      interval: t.string({ required: false })
    })
  }
)

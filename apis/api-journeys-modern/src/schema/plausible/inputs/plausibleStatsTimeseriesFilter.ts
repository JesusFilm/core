import { builder } from '../../builder'

export const PlausibleStatsTimeseriesFilter = builder.inputType(
  'PlausibleStatsTimeseriesFilter',
  {
    fields: (t) => ({
      period: t.string({ required: false }),
      date: t.string({ required: false }),
      filters: t.string({ required: false }),
      interval: t.string({ required: false })
    })
  }
)

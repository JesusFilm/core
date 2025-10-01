import { builder } from '../../builder'

export const PlausibleStatsBreakdownFilter = builder.inputType(
  'PlausibleStatsBreakdownFilter',
  {
    fields: (t) => ({
      property: t.string({ required: true }),
      period: t.string({ required: false }),
      date: t.string({ required: false }),
      limit: t.int({ required: false }),
      page: t.int({ required: false }),
      filters: t.string({ required: false })
    })
  }
)

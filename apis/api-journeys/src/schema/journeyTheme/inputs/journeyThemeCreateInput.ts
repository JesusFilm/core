import { builder } from '../../builder'

export const JourneyThemeCreateInput = builder.inputType(
  'JourneyThemeCreateInput',
  {
    fields: (t) => ({
      journeyId: t.id({ required: true }),
      bodyFont: t.string({ required: false }),
      headerFont: t.string({ required: false }),
      labelFont: t.string({ required: false })
    })
  }
)

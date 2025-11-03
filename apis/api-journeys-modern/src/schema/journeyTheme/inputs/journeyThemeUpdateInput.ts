import { builder } from '../../builder'

export const JourneyThemeUpdateInput = builder.inputType(
  'JourneyThemeUpdateInput',
  {
    fields: (t) => ({
      bodyFont: t.string({ required: false }),
      headerFont: t.string({ required: false }),
      labelFont: t.string({ required: false })
    })
  }
)

import { builder } from '../../builder'

export const VisitorUpdateForCurrentUserInput = builder.inputType(
  'VisitorUpdateForCurrentUserInput',
  {
    fields: (t) => ({
      countryCode: t.string({ required: false }),
      email: t.string({ required: false }),
      name: t.string({ required: false }),
      referrer: t.string({ required: false })
    })
  }
)

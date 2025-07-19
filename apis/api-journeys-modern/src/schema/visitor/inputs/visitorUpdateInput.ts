import { builder } from '../../builder'

export const VisitorUpdateInput = builder.inputType('VisitorUpdateInput', {
  fields: (t) => ({
    countryCode: t.string({ required: false }),
    email: t.string({ required: false }),
    name: t.string({ required: false }),
    notes: t.string({ required: false }),
    phone: t.string({ required: false }),
    referrer: t.string({ required: false })
  })
})

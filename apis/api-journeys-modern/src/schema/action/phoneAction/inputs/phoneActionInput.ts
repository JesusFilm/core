import { builder } from '../../../builder'

export const PhoneActionInput = builder.inputType('PhoneActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    phone: t.string({ required: true }),
    countryCode: t.string({ required: true })
  })
})

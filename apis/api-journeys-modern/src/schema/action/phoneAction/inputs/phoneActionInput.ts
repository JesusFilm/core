import { builder } from '../../../builder'
import { ContactActionType } from '../enums/contactActionType'

export const PhoneActionInput = builder.inputType('PhoneActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    phone: t.string({ required: true }),
    countryCode: t.string({ required: true }),
    contactAction: t.field({
      type: ContactActionType,
      required: false,
      defaultValue: 'call'
    })
  })
})

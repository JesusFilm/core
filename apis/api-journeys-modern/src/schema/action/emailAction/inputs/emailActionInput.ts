import { builder } from '../../../builder'

export const EmailActionInput = builder.inputType('EmailActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    email: t.string({ required: true }),
    customizable: t.boolean({ required: false }),
    parentStepId: t.string({ required: false })
  })
})

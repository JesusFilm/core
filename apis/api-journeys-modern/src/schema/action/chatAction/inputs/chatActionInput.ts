import { builder } from '../../../builder'

export const ChatActionInput = builder.inputType('ChatActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    chatUrl: t.string({ required: true }),
    target: t.string({ required: false }),
    customizable: t.boolean({ required: false }),
    parentStepId: t.string({ required: false })
  })
})

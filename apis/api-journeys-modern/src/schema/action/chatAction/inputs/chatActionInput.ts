import { builder } from '../../../builder'
import { MessagePlatform } from '../../../enums'

export const ChatActionInput = builder.inputType('ChatActionInput', {
  fields: (t) => ({
    gtmEventName: t.string({ required: false }),
    url: t.string({ required: true }),
    target: t.string({ required: false }),
    customizable: t.boolean({ required: false }),
    parentStepId: t.string({ required: false }),
    chatPlatform: t.field({
      type: MessagePlatform,
      required: false
    })
  })
})

import { builder } from '../../builder'

export const BlockUpdateActionInput = builder.inputType(
  'BlockUpdateActionInput',
  {
    fields: (t) => ({
      gtmEventName: t.string({ required: false }),
      email: t.string({ required: false }),
      url: t.string({ required: false }),
      phone: t.string({ required: false }),
      countryCode: t.string({ required: false }),
      target: t.string({ required: false }),
      blockId: t.string({ required: false }),
      chatUrl: t.string({ required: false })
    })
  }
)

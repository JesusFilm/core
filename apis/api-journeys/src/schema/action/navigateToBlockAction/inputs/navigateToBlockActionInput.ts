import { builder } from '../../../builder'

export const NavigateToBlockActionInput = builder.inputType(
  'NavigateToBlockActionInput',
  {
    fields: (t) => ({
      gtmEventName: t.string({ required: false }),
      blockId: t.string({ required: true })
    })
  }
)

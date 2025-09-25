import { builder } from '../../../builder'
import { ButtonActionEnum } from '../enums'

export const ButtonClickEventCreateInput = builder.inputType(
  'ButtonClickEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false }),
      action: t.field({ type: ButtonActionEnum, required: false }),
      actionValue: t.string({ required: false })
    })
  }
)

import { builder } from '../../../builder'
import { ButtonActionEnum } from '../enums'

export const ButtonClickEventCreateInput = builder.inputType(
  'ButtonClickEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false }),
      action: t.field({ type: ButtonActionEnum, required: false }),
      actionValue: t.string({ required: false })
    })
  }
)

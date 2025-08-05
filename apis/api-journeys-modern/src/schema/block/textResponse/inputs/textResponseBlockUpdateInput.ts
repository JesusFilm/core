import { builder } from '../../../builder'
import { TextResponseType } from '../enums/textResponseType'

export const TextResponseBlockUpdateInput = builder.inputType(
    'TextResponseBlockUpdateInput',
    {
      fields: (t) => ({
        parentBlockId: t.id({ required: false }),
        label: t.string({ required: false }),
        placeholder: t.string({ required: false }),
        required: t.boolean({ required: false }),
        hint: t.string({ required: false }),
        minRows: t.int({ required: false }),
        routeId: t.string({ required: false }),
        type: t.field({ type: TextResponseType, required: false }),
        integrationId: t.string({ required: false })
      })
    }
  )
import { builder } from '../../../builder'
import { IconColor } from '../enums/iconColor'
import { IconName } from '../enums/iconName'
import { IconSize } from '../enums/iconSize'

export const IconBlockCreateInput = builder.inputType('IconBlockCreateInput', {
  fields: (t) => ({
    id: t.id({
      required: false,
      description:
        'ID should be unique Response UUID (Provided for optimistic mutation result matching)'
    }),
    parentBlockId: t.id({ required: true }),
    journeyId: t.id({ required: true }),
    name: t.field({ type: IconName, required: false }),
    color: t.field({ type: IconColor, required: false }),
    size: t.field({ type: IconSize, required: false })
  })
})

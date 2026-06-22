import { builder } from '../../../builder'
import { IconColor } from '../enums/iconColor'
import { IconName } from '../enums/iconName'
import { IconSize } from '../enums/iconSize'

export const IconBlockUpdateInput = builder.inputType('IconBlockUpdateInput', {
  fields: (t) => ({
    name: t.field({ type: IconName, required: false }),
    color: t.field({ type: IconColor, required: false }),
    size: t.field({ type: IconSize, required: false })
  })
})

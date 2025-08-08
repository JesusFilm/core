import { builder } from '../../../builder'
import { ButtonColor, ButtonSize, ButtonVariant } from '../enums'
import { ButtonBlockSettingsInput } from '../inputs/buttonBlockSettingsInput'

export const ButtonBlockUpdateInput = builder.inputType(
  'ButtonBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      label: t.string({ required: false }),
      variant: t.field({ type: ButtonVariant, required: false }),
      color: t.field({ type: ButtonColor, required: false }),
      size: t.field({ type: ButtonSize, required: false }),
      startIconId: t.id({ required: false }),
      endIconId: t.id({ required: false }),
      submitEnabled: t.boolean({ required: false }),
      settings: t.field({ type: ButtonBlockSettingsInput, required: false })
    })
  }
)

import { builder } from '../../../builder'
import { ButtonColor, ButtonSize, ButtonVariant } from '../enums'
import { ButtonBlockSettingsInput } from '../inputs/buttonBlockSettingsInput'

export const ButtonBlockCreateInput = builder.inputType(
  'ButtonBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      label: t.string({ required: true }),
      variant: t.field({ type: ButtonVariant, required: false }),
      color: t.field({ type: ButtonColor, required: false }),
      size: t.field({ type: ButtonSize, required: false }),
      submitEnabled: t.boolean({ required: false }),
      settings: t.field({ type: ButtonBlockSettingsInput, required: false })
    })
  }
)

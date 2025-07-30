import { builder } from '../../../../builder'

export const ButtonBlockSettingsInput = builder.inputType(
  'ButtonBlockSettingsInput',
  {
    fields: (t) => ({
      alignment: t.field({ type: ButtonAlignment, required: false }),
      color: t.string({ required: false })
    })
  }
)

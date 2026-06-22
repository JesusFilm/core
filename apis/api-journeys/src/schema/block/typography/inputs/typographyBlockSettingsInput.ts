import { builder } from '../../../builder'

export const TypographyBlockSettingsInput = builder.inputType(
  'TypographyBlockSettingsInput',
  {
    fields: (t) => ({
      color: t.string({ required: false })
    })
  }
)

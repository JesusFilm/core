import { builder } from '../../../builder'
import { TypographyAlign } from '../enums/typographyAlign'
import { TypographyColor } from '../enums/typographyColor'
import { TypographyVariant } from '../enums/typographyVariant'

import { TypographyBlockSettingsInput } from './typographyBlockSettingsInput'

export const TypographyBlockCreateInput = builder.inputType(
  'TypographyBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      content: t.string({ required: true }),
      variant: t.field({ type: TypographyVariant, required: false }),
      color: t.field({ type: TypographyColor, required: false }),
      align: t.field({ type: TypographyAlign, required: false }),
      settings: t.field({ type: TypographyBlockSettingsInput, required: false })
    })
  }
)

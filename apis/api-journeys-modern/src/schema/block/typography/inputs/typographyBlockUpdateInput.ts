import { builder } from '../../../builder'
import { TypographyAlign } from '../enums/typographyAlign'
import { TypographyColor } from '../enums/typographyColor'
import { TypographyVariant } from '../enums/typographyVariant'

import { TypographyBlockSettingsInput } from './typographyBlockSettingsInput'

export const TypographyBlockUpdateInput = builder.inputType(
  'TypographyBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      content: t.string({ required: false }),
      variant: t.field({ type: TypographyVariant, required: false }),
      color: t.field({ type: TypographyColor, required: false }),
      align: t.field({ type: TypographyAlign, required: false }),
      settings: t.field({ type: TypographyBlockSettingsInput, required: false })
    })
  }
)

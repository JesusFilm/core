import { TypographyAlign } from '../../../../block/typography/enums/typographyAlign'
import { TypographyVariant } from '../../../../block/typography/enums/typographyVariant'
import { builder } from '../../../../builder'
import { CampaignChildPlacement } from '../../../enums'

export const CampaignTypographyBlockUpdateInput = builder.inputType(
  'CampaignTypographyBlockUpdateInput',
  {
    fields: (t) => ({
      content: t.string({
        required: false,
        description: 'Default-language text. At most 2000 characters.'
      }),
      variant: t.field({ type: TypographyVariant, required: false }),
      align: t.field({ type: TypographyAlign, required: false }),
      color: t.string({ required: false, description: '`#RRGGBB` or null.' }),
      placement: t.field({ type: CampaignChildPlacement, required: false })
    })
  }
)

import { TypographyAlign } from '../../../../block/typography/enums/typographyAlign'
import { TypographyVariant } from '../../../../block/typography/enums/typographyVariant'
import { builder } from '../../../../builder'
import { CampaignChildPlacement } from '../../../enums'

export const CampaignTypographyBlockCreateInput = builder.inputType(
  'CampaignTypographyBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      parentBlockId: t.id({
        required: true,
        description: 'A section or chrome block of the campaign.'
      }),
      content: t.string({
        required: false,
        description:
          'Default-language text; empty when omitted. At most 2000 characters.'
      }),
      variant: t.field({ type: TypographyVariant, required: false }),
      align: t.field({
        type: TypographyAlign,
        required: false,
        description: 'Null follows the section.'
      }),
      color: t.string({ required: false, description: '`#RRGGBB` or null.' }),
      placement: t.field({
        type: CampaignChildPlacement,
        required: false,
        description: 'Defaults to `below`.'
      })
    })
  }
)

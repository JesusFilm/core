import { ButtonSize } from '../../../../block/button/enums/buttonSize'
import { ButtonVariant } from '../../../../block/button/enums/buttonVariant'
import { TypographyAlign } from '../../../../block/typography/enums/typographyAlign'
import { builder } from '../../../../builder'
import { CampaignChildPlacement } from '../../../enums'

export const CampaignButtonBlockCreateInput = builder.inputType(
  'CampaignButtonBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      parentBlockId: t.id({
        required: true,
        description: 'A section or chrome block of the campaign.'
      }),
      label: t.string({
        required: false,
        description:
          'Default-language label; "Button" when omitted. At most 60 characters.'
      }),
      variant: t.field({ type: ButtonVariant, required: false }),
      size: t.field({ type: ButtonSize, required: false }),
      align: t.field({
        type: TypographyAlign,
        required: false,
        description: 'Null follows the section.'
      }),
      color: t.string({ required: false, description: '`#RRGGBB` or null.' }),
      labelColor: t.string({
        required: false,
        description: '`#RRGGBB` or null.'
      }),
      placement: t.field({
        type: CampaignChildPlacement,
        required: false,
        description: 'Defaults to `below`.'
      })
    })
  }
)

import { ButtonSize } from '../../../../block/button/enums/buttonSize'
import { ButtonVariant } from '../../../../block/button/enums/buttonVariant'
import { TypographyAlign } from '../../../../block/typography/enums/typographyAlign'
import { builder } from '../../../../builder'
import { CampaignChildPlacement } from '../../../enums'

export const CampaignButtonBlockUpdateInput = builder.inputType(
  'CampaignButtonBlockUpdateInput',
  {
    fields: (t) => ({
      label: t.string({
        required: false,
        description: 'Default-language label. At most 60 characters.'
      }),
      variant: t.field({ type: ButtonVariant, required: false }),
      size: t.field({ type: ButtonSize, required: false }),
      align: t.field({ type: TypographyAlign, required: false }),
      color: t.string({ required: false, description: '`#RRGGBB` or null.' }),
      labelColor: t.string({
        required: false,
        description: '`#RRGGBB` or null.'
      }),
      placement: t.field({ type: CampaignChildPlacement, required: false })
    })
  }
)

import { builder } from '../../builder'
import { TypographyAlign } from '../../block/typography/enums/typographyAlign'
import { TypographyVariant } from '../../block/typography/enums/typographyVariant'
import { CampaignChildPlacement } from '../enums'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'

export const CampaignTypographyBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignTypographyBlock',
  interfaces: [CampaignBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignTypographyBlock',
  description:
    'The campaign text block: an Extra of a section or chrome block, or a Region Line when regionId is set. The variant decides size, weight and font family through the Campaign Theme.',
  fields: (t) => ({
    content: t.string({
      nullable: false,
      resolve: (block) => block.content ?? ''
    }),
    contentTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.contentTranslations)
    }),
    variant: t.field({
      type: TypographyVariant,
      nullable: true,
      description: 'Null means body1.',
      resolve: (block) => block.typographyVariant
    }),
    align: t.field({
      type: TypographyAlign,
      nullable: true,
      description: 'Null means inherit from the section.',
      resolve: (block) => block.align
    }),
    color: t.exposeString('color', {
      nullable: true,
      description: '`#RRGGBB`; null means the section override, then the theme.'
    }),
    placement: t.expose('placement', {
      type: CampaignChildPlacement,
      nullable: true,
      description:
        'Which side of the Section Body this Extra renders on; null on a Region Line.'
    })
  })
})

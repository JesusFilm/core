import { builder } from '../../builder'
import { CampaignSwitcherVariant } from '../enums'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignRegionSwitcherBlock = builder.prismaObject(
  'CampaignBlock',
  {
    variant: 'CampaignRegionSwitcherBlock',
    interfaces: [CampaignBlock, CampaignSectionBlock],
    isTypeOf: (block: any) => block.typename === 'CampaignRegionSwitcherBlock',
    description:
      'Lists the listed Campaign Regions by order. Holds no items of its own: it reads CampaignRegion rows live.',
    fields: (t) => ({
      title: t.exposeString('title', { nullable: true }),
      titleTranslations: t.field({
        type: [TranslatedValueRef],
        nullable: false,
        resolve: (block) => toTranslatedValues(block.titleTranslations)
      }),
      variant: t.field({
        type: CampaignSwitcherVariant,
        nullable: false,
        resolve: (block) => block.switcherVariant ?? 'cards'
      })
    })
  }
)

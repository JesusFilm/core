import { builder } from '../../builder'
import { CampaignSwitcherVariant } from '../enums'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'
import { translationsField } from './translationsField'

export const CampaignRegionSwitcherBlock = builder.prismaObject(
  'CampaignBlock',
  {
    variant: 'CampaignRegionSwitcherBlock',
    interfaces: [CampaignBlock, CampaignSectionBlock],
    isTypeOf: (block: unknown) =>
      isCampaignBlockOfType(block, 'CampaignRegionSwitcherBlock'),
    description:
      'Lists the listed Campaign Regions by order. Holds no items of its own: it reads CampaignRegion rows live.',
    fields: (t) => ({
      title: t.exposeString('title', { nullable: true }),
      titleTranslations: translationsField(t, 'title'),
      variant: t.field({
        type: CampaignSwitcherVariant,
        nullable: false,
        resolve: (block) => block.switcherVariant ?? 'cards'
      })
    })
  }
)

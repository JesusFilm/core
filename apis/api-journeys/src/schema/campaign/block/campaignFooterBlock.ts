import { builder } from '../../builder'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignFooterBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignFooterBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignFooterBlock',
  description:
    'Campaign Chrome: the one footer every page shares. pageId and regionId are both null. Typography children are the footer lines, button children the footer links. Never deletable, movable or duplicable.',
  fields: () => ({})
})

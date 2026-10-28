import { builder } from '../../builder'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignFooterBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignFooterBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignFooterBlock'),
  description:
    'Campaign Chrome: the one footer every page shares. pageId and regionId are both null. Typography children are the footer lines, button children the footer links. Never deletable, movable or duplicable.',
  fields: () => ({})
})

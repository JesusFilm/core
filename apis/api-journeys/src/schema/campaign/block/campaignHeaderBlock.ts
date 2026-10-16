import { builder } from '../../builder'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignHeaderBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignHeaderBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignHeaderBlock',
  description:
    'Campaign Chrome: the one header every page shares. pageId and regionId are both null. Button children are the nav links; the brand mark and language select are fixed renderer elements, not blocks. Never deletable, movable or duplicable.',
  fields: (t) => ({
    logoBlockId: t.exposeID('logoBlockId', {
      nullable: true,
      description: 'The owned CampaignImageBlock shown as the brand mark.'
    })
  })
})

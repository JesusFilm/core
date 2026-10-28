import { builder } from '../../builder'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'
import { translationsField } from './translationsField'

export const CampaignRegionHeaderBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignRegionHeaderBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignRegionHeaderBlock'),
  description:
    "Region Page only. Renders the rendered region's name, its Region Lines and this intro.",
  fields: (t) => ({
    intro: t.exposeString('intro', { nullable: true }),
    introTranslations: translationsField(t, 'intro')
  })
})

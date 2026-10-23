import { builder } from '../../builder'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'
import { translationsField } from './translationsField'

export const CampaignRegionShareBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignRegionShareBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignRegionShareBlock'),
  description:
    "Region Page only. The share panel: the region's Share Languages, the linked journey preview, the Share Link and QR Code, read live from CampaignRegionLanguage.",
  fields: (t) => ({
    title: t.exposeString('title', { nullable: true }),
    titleTranslations: translationsField(t, 'title'),
    intro: t.exposeString('intro', { nullable: true }),
    introTranslations: translationsField(t, 'intro')
  })
})

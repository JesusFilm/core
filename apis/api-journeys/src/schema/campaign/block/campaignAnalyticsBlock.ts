import { builder } from '../../builder'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'
import { translationsField } from './translationsField'

export const CampaignAnalyticsBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignAnalyticsBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignAnalyticsBlock'),
  description:
    'Shows Campaign Stats: visitor tiles, a ranked country list and optionally the world map. Scope (whole campaign on the landing page, one region on the Region Page) is derived from the page, not stored.',
  fields: (t) => ({
    eyebrow: t.exposeString('eyebrow', { nullable: true }),
    eyebrowTranslations: translationsField(t, 'eyebrow'),
    title: t.exposeString('title', { nullable: true }),
    titleTranslations: translationsField(t, 'title'),
    showMap: t.boolean({
      nullable: false,
      resolve: (block) => block.showMap ?? false
    })
  })
})

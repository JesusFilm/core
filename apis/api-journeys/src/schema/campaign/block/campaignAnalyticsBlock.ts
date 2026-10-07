import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignAnalyticsBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignAnalyticsBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignAnalyticsBlock',
  description:
    'Shows Campaign Stats: visitor tiles, a ranked country list and optionally the world map. Scope (whole campaign on the landing page, one region on the Region Page) is derived from the page, not stored.',
  fields: (t) => ({
    eyebrow: t.exposeString('eyebrow', { nullable: true }),
    eyebrowTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.eyebrowTranslations)
    }),
    title: t.exposeString('title', { nullable: true }),
    titleTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.titleTranslations)
    }),
    showMap: t.boolean({
      nullable: false,
      resolve: (block) => block.showMap ?? false
    })
  })
})

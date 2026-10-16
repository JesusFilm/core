import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignRegionShareBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignRegionShareBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignRegionShareBlock',
  description:
    "Region Page only. The share panel: the region's Share Languages, the linked journey preview, the Share Link and QR Code, read live from CampaignRegionLanguage.",
  fields: (t) => ({
    title: t.exposeString('title', { nullable: true }),
    titleTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.titleTranslations)
    }),
    intro: t.exposeString('intro', { nullable: true }),
    introTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.introTranslations)
    })
  })
})

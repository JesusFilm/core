import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignRegionHeaderBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignRegionHeaderBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignRegionHeaderBlock',
  description:
    "Region Page only. Renders the rendered region's name, its Region Lines and this intro.",
  fields: (t) => ({
    intro: t.exposeString('intro', { nullable: true }),
    introTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.introTranslations)
    })
  })
})

import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignVideoCarouselBlock = builder.prismaObject(
  'CampaignBlock',
  {
    variant: 'CampaignVideoCarouselBlock',
    interfaces: [CampaignBlock, CampaignSectionBlock],
    isTypeOf: (block: any) => block.typename === 'CampaignVideoCarouselBlock',
    description:
      'A shelf of video cards. `videoId` set means Watch expansion of that Video at read time and explicit children are ignored; null means the ordered CampaignVideoBlock children are the items.',
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
      videoId: t.exposeID('videoId', {
        nullable: true,
        description: 'The Watch Video to expand; null for explicit children.'
      }),
      videoVariantLanguageId: t.exposeID('videoVariantLanguageId', {
        nullable: true
      })
    })
  }
)

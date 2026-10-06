import { VideoBlockSource } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { Video } from '../../mediaVideo/mediaVideo'
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
        nullable: true,
        description:
          'The campaign language when the Watch Video was linked; the language the expansion resolves in.'
      }),
      video: t.field({
        type: Video,
        nullable: true,
        description:
          'Watch expansion: the federated `Video` reference (`id`, `primaryLanguageId`) the gateway joins for `children` and `childrenCount`; api-journeys never fetches or caches it. Null in explicit mode.',
        resolve: (block) => {
          if (block.videoId == null || block.videoVariantLanguageId == null)
            return null
          return {
            id: block.videoId,
            primaryLanguageId: block.videoVariantLanguageId,
            source: VideoBlockSource.internal
          }
        }
      })
    })
  }
)

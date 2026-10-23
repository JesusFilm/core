import { builder } from '../../builder'
import { CampaignJourneyListDisplay } from '../enums'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'
import { translationsField } from './translationsField'

export const CampaignJourneyListBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignJourneyListBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignJourneyListBlock'),
  description:
    'Ready-made journeys as cards. Items are the ordered CampaignJourneyBlock children.',
  fields: (t) => ({
    eyebrow: t.exposeString('eyebrow', { nullable: true }),
    eyebrowTranslations: translationsField(t, 'eyebrow'),
    title: t.exposeString('title', { nullable: true }),
    titleTranslations: translationsField(t, 'title'),
    description: t.exposeString('description', { nullable: true }),
    descriptionTranslations: translationsField(t, 'description'),
    display: t.field({
      type: CampaignJourneyListDisplay,
      nullable: false,
      resolve: (block) => block.display ?? 'grid'
    })
  })
})

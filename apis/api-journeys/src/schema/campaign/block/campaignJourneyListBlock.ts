import { builder } from '../../builder'
import { CampaignJourneyListDisplay } from '../enums'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignJourneyListBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignJourneyListBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignJourneyListBlock',
  description:
    'Ready-made journeys as cards. Items are the ordered CampaignJourneyBlock children.',
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
    lede: t.exposeString('lede', { nullable: true }),
    ledeTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.ledeTranslations)
    }),
    display: t.field({
      type: CampaignJourneyListDisplay,
      nullable: false,
      resolve: (block) => block.display ?? 'grid'
    })
  })
})

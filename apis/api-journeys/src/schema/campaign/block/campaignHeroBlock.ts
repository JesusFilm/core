import { TypographyAlign } from '../../block/typography/enums/typographyAlign'
import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignHeroBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignHeroBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignHeroBlock'),
  description:
    'The opening section of a page: eyebrow, title and description over an optional Media Slot. A call to action is always a CampaignButtonBlock Extra.',
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
    description: t.exposeString('description', { nullable: true }),
    descriptionTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.descriptionTranslations)
    }),
    align: t.field({
      type: TypographyAlign,
      nullable: true,
      description:
        'Alignment of the Section Body; the editor offers left and center.',
      resolve: (block) => block.align
    }),
    mediaBlockId: t.exposeID('mediaBlockId', {
      nullable: true,
      description:
        'The owned CampaignVideoBlock or CampaignImageBlock in the Media Slot.'
    }),
    minHeight: t.exposeInt('minHeight', {
      nullable: true,
      description:
        'Minimum height as a percentage of the viewport height (0 to 100), the text centred within it; null leaves the hero as tall as its content.'
    })
  })
})

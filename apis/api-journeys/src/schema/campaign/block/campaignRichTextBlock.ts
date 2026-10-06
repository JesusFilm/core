import { builder } from '../../builder'
import { TranslatedValueRef, toTranslatedValues } from '../translatedValue'

import { CampaignBlock } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'

export const CampaignRichTextBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignRichTextBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: any) => block.typename === 'CampaignRichTextBlock',
  description:
    'A title and one content column. `content` is one text column; the viewer splits it on blank lines into paragraphs.',
  fields: (t) => ({
    title: t.exposeString('title', { nullable: true }),
    titleTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.titleTranslations)
    }),
    content: t.exposeString('content', {
      nullable: true,
      description: 'Paragraphs separated by blank lines.'
    }),
    contentTranslations: t.field({
      type: [TranslatedValueRef],
      nullable: false,
      resolve: (block) => toTranslatedValues(block.contentTranslations)
    })
  })
})

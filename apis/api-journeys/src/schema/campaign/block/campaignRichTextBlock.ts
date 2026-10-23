import { builder } from '../../builder'

import { CampaignBlock, isCampaignBlockOfType } from './campaignBlock'
import { CampaignSectionBlock } from './campaignSectionBlock'
import { translationsField } from './translationsField'

export const CampaignRichTextBlock = builder.prismaObject('CampaignBlock', {
  variant: 'CampaignRichTextBlock',
  interfaces: [CampaignBlock, CampaignSectionBlock],
  isTypeOf: (block: unknown) =>
    isCampaignBlockOfType(block, 'CampaignRichTextBlock'),
  description:
    'A title and one content column. `content` is one text column; the viewer splits it on blank lines into paragraphs.',
  fields: (t) => ({
    title: t.exposeString('title', { nullable: true }),
    titleTranslations: translationsField(t, 'title'),
    content: t.exposeString('content', {
      nullable: true,
      description: 'Paragraphs separated by blank lines.'
    }),
    contentTranslations: translationsField(t, 'content')
  })
})

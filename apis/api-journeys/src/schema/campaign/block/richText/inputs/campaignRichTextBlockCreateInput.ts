import { builder } from '../../../../builder'
import { SECTION_PARENT_BLOCK_ID_DESCRIPTION } from '../../createSection'

export const CampaignRichTextBlockCreateInput = builder.inputType(
  'CampaignRichTextBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      campaignId: t.id({ required: true }),
      pageId: t.id({ required: true, description: 'A page of the campaign.' }),
      parentBlockId: t.id({
        required: false,
        description: SECTION_PARENT_BLOCK_ID_DESCRIPTION
      }),
      parentOrder: t.int({
        required: false,
        description:
          'Position among the page’s sections; appended when omitted or past the end.'
      }),
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      content: t.string({
        required: false,
        description:
          'At most 5000 characters; paragraphs separated by blank lines.'
      })
    })
  }
)

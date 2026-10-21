import { builder } from '../../../../builder'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRichTextBlockUpdateInput = builder.inputType(
  'CampaignRichTextBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: 'At most 150 characters.'
      }),
      content: t.string({
        required: false,
        description:
          'At most 5000 characters; paragraphs separated by blank lines.'
      }),
      ...sectionStyleInputFields(t)
    })
  }
)

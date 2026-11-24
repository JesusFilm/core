import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import { sectionStyleInputFields } from '../../inputs/sectionStyleInput'

export const CampaignRichTextBlockUpdateInput = builder.inputType(
  'CampaignRichTextBlockUpdateInput',
  {
    fields: (t) => ({
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      content: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.richTextContent} characters; paragraphs separated by blank lines.`
      }),
      ...sectionStyleInputFields(t)
    })
  }
)

import { builder } from '../../../../builder'
import { TEXT_CAPS } from '../../../validation'
import { sectionCreateInputFields } from '../../inputs/sectionCreateInput'

export const CampaignRichTextBlockCreateInput = builder.inputType(
  'CampaignRichTextBlockCreateInput',
  {
    fields: (t) => ({
      ...sectionCreateInputFields(t),
      title: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.title} characters.`
      }),
      content: t.string({
        required: false,
        description: `At most ${TEXT_CAPS.richTextContent} characters; paragraphs separated by blank lines.`
      })
    })
  }
)

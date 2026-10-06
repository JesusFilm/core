import { builder } from '../../../builder'
import { CampaignRichTextBlock } from '../campaignRichTextBlock'
import {
  SECTION_CREATE_ERRORS,
  SECTION_PARENT_BLOCK_ID_DESCRIPTION,
  createSection
} from '../createSection'
import { validateSectionText } from '../validateSectionText'

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

builder.mutationField('campaignRichTextBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRichTextBlock,
    nullable: false,
    description: `Add a rich text section to a page, last among its sections or at \`parentOrder\` with the later sections renumbered. Text is empty when omitted.\n\n${SECTION_CREATE_ERRORS}\n- BAD_USER_INPUT (field: \`title\` / \`content\`): over 150 / 5000 characters.`,
    args: {
      input: t.arg({ type: CampaignRichTextBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) =>
      await createSection(input, 'CampaignRichTextBlock', context.user, () =>
        validateSectionText(input, ['title', 'content'])
      )
  })
)

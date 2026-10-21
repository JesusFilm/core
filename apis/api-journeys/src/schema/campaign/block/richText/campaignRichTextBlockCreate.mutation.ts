import { builder } from '../../../builder'
import { CampaignRichTextBlock } from '../campaignRichTextBlock'
import { SECTION_CREATE_ERRORS, createSection } from '../createSection'
import { validateSectionText } from '../validateSectionText'

import { CampaignRichTextBlockCreateInput } from './inputs'

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

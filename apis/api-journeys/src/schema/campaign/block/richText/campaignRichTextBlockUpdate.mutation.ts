import { builder } from '../../../builder'
import { CampaignRichTextBlock } from '../campaignRichTextBlock'
import { authorizeTypedBlockUpdate, updateBlock } from '../service'
import { validateSectionText } from '../validateSectionText'

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
      })
    })
  }
)

builder.mutationField('campaignRichTextBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRichTextBlock,
    nullable: false,
    description:
      'Update the rich text section’s default-language title or content. Only the given fields change; empty text is allowed and not rendered.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignRichTextBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `title` / `content`): over 150 / 5000 characters.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignRichTextBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignRichTextBlock'
      )
      return await updateBlock(
        block,
        validateSectionText(input, ['title', 'content'])
      )
    }
  })
)

import { builder } from '../../../builder'
import { TEXT_CAPS } from '../../validation'
import { CampaignRichTextBlock } from '../campaignRichTextBlock'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'
import { validateSectionText } from '../validateSectionText'

import { CampaignRichTextBlockUpdateInput } from './inputs'

builder.mutationField('campaignRichTextBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRichTextBlock,
    nullable: false,
    description: `Update the rich text section’s default-language title or content, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignRichTextBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`title\` / \`content\`): over ${TEXT_CAPS.title} / ${TEXT_CAPS.richTextContent} characters.\n${SECTION_STYLE_ERRORS}`,
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
      return await updateBlock(block, {
        ...validateSectionText('CampaignRichTextBlock', input),
        ...sectionStyleColumns(input)
      })
    }
  })
)

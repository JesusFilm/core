import { builder } from '../../../builder'
import { CampaignFeaturedMediaBlock } from '../campaignFeaturedMediaBlock'
import { MEDIA_SLOT_ERRORS, mediaSlotColumns } from '../inputs/mediaSlotInput'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'

import { CampaignFeaturedMediaBlockUpdateInput } from './inputs'
import { validateFeaturedMediaInput } from './validateFeaturedMediaInput'

builder.mutationField('campaignFeaturedMediaBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignFeaturedMediaBlock,
    nullable: false,
    description: `Update a Featured Media section’s default-language eyebrow, title, description or bullets, its media side or layout, its Media Slot, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignFeaturedMediaBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`description\` / \`bullets\`): over 80 / 150 / 500 / 1000 characters.\n- BAD_USER_INPUT (field: \`mediaSide\`): not left or right.\n- BAD_USER_INPUT (field: \`layout\`): not sideBySide or stacked.\n${MEDIA_SLOT_ERRORS}\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignFeaturedMediaBlockUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignFeaturedMediaBlock'
      )
      const body = validateFeaturedMediaInput(input)
      const style = sectionStyleColumns(input)
      return await updateBlock(block, {
        ...body,
        ...style,
        ...mediaSlotColumns(input.mediaBlockId)
      })
    }
  })
)

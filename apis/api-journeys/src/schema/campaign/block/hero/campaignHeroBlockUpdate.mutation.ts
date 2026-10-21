import { builder } from '../../../builder'
import { assertEnumOrNull, assertPercentOrNull } from '../../validation'
import { CampaignHeroBlock } from '../campaignHeroBlock'
import { MEDIA_SLOT_ERRORS, mediaSlotColumns } from '../inputs/mediaSlotInput'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'
import { CAMPAIGN_ALIGNS } from '../typography/validateTypographyInput'
import { validateSectionText } from '../validateSectionText'

import { CampaignHeroBlockUpdateInput } from './inputs'

builder.mutationField('campaignHeroBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignHeroBlock,
    nullable: false,
    description: `Update the hero’s default-language eyebrow, title, description or alignment, its Media Slot, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignHeroBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\` / \`description\`): over 80 / 150 / 500 characters.\n- BAD_USER_INPUT (field: \`align\`): not left, center or right.\n- BAD_USER_INPUT (field: \`minHeight\`): not a whole number from 0 to 100.\n${MEDIA_SLOT_ERRORS}\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignHeroBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignHeroBlock'
      )
      const text = validateSectionText(input, [
        'eyebrow',
        'title',
        'description'
      ])
      const align =
        input.align !== undefined
          ? { align: assertEnumOrNull(input.align, 'align', CAMPAIGN_ALIGNS) }
          : {}
      const minHeight =
        input.minHeight !== undefined
          ? { minHeight: assertPercentOrNull(input.minHeight, 'minHeight') }
          : {}
      const style = sectionStyleColumns(input)
      return await updateBlock(block, {
        ...text,
        ...align,
        ...minHeight,
        ...style,
        ...mediaSlotColumns(input.mediaBlockId)
      })
    }
  })
)

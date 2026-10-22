import { builder } from '../../../builder'
import { TEXT_CAPS, assertNotNull } from '../../validation'
import { CampaignAnalyticsBlock } from '../campaignAnalyticsBlock'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'
import { validateSectionText } from '../validateSectionText'

import { CampaignAnalyticsBlockUpdateInput } from './inputs'

builder.mutationField('campaignAnalyticsBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignAnalyticsBlock,
    nullable: false,
    description: `Update the analytics section’s default-language eyebrow or title, whether the world map shows, or its Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignAnalyticsBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`eyebrow\` / \`title\`): over ${TEXT_CAPS.eyebrow} / ${TEXT_CAPS.title} characters.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignAnalyticsBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignAnalyticsBlock'
      )
      return await updateBlock(block, {
        ...validateSectionText(input, ['eyebrow', 'title']),
        showMap: assertNotNull(input.showMap, 'showMap'),
        ...sectionStyleColumns(input)
      })
    }
  })
)

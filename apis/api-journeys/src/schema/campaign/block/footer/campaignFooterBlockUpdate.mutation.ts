import { builder } from '../../../builder'
import { CampaignFooterBlock } from '../campaignFooterBlock'
import { SECTION_STYLE_ERRORS } from '../inputs/sectionStyleInput'
import {
  authorizeTypedBlockUpdate,
  sectionStyleColumns,
  updateBlock
} from '../service'

import { CampaignFooterBlockUpdateInput } from './inputs'

builder.mutationField('campaignFooterBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignFooterBlock,
    nullable: false,
    description: `Update the footer’s Section Background and colour overrides. Only the given fields change.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to the live CampaignFooterBlock.\n- FORBIDDEN: caller is not in the team.\n${SECTION_STYLE_ERRORS}`,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignFooterBlockUpdateInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignFooterBlock'
      )
      return await updateBlock(block, sectionStyleColumns(input))
    }
  })
)

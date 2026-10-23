import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { badUserInput } from '../errors'

import { CampaignScrollToBlockActionRef } from './campaignAction'
import { CampaignScrollToBlockActionInput } from './inputs'
import { authorizeActionUpdate, upsertAction } from './service'

builder.mutationField('campaignBlockUpdateScrollToBlockAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignScrollToBlockActionRef,
    nullable: false,
    description:
      'Point a button at a section of its own page: the public page scrolls to `#<blockId>`. A header or footer button, which belongs to no page, may target a section of either page. The button’s one action becomes this scroll; any link or region target it had is cleared.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.\n- BAD_USER_INPUT (field: `blockId`): not a live top-level section of this campaign on the button’s page (an Extra, an owned block, the header, the footer and a region block are refused).',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignScrollToBlockActionInput, required: true })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeActionUpdate(String(id), context.user)
      const target = await prisma.campaignBlock.findFirst({
        where: {
          id: String(input.blockId),
          campaignId: block.campaignId,
          deletedAt: null,
          parentBlockId: null,
          parentOrder: { not: null },
          pageId: block.pageId != null ? block.pageId : { not: null }
        },
        select: { id: true }
      })
      if (target == null)
        throw badUserInput(
          'blockId must be a live section of the button’s page',
          'blockId'
        )
      return await upsertAction(block, { blockId: target.id })
    }
  })
)

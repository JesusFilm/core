import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { badUserInput } from '../validation'

import { CampaignScrollToBlockActionRef } from './campaignAction'
import { CampaignScrollToBlockActionInput } from './inputs'
import { authorizeActionUpdate, upsertAction } from './service'

builder.mutationField('campaignBlockUpdateScrollToBlockAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignScrollToBlockActionRef,
    nullable: false,
    description:
      'Point a button at a block of the same campaign: the public page scrolls to `#<blockId>` when the target is on the same page and renders the button static otherwise. The button’s one action becomes this scroll; any link or region target it had is cleared.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.\n- BAD_USER_INPUT (field: `blockId`): not a live block of this campaign.',
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
          deletedAt: null
        },
        select: { id: true }
      })
      if (target == null)
        throw badUserInput(
          'blockId must be a live block of this campaign',
          'blockId'
        )
      return await upsertAction(block, { blockId: target.id })
    }
  })
)

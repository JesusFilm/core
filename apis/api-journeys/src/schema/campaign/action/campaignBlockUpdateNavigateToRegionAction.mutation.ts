import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { badUserInput } from '../validation'

import { CampaignNavigateToRegionActionRef } from './campaignAction'
import { CampaignNavigateToRegionActionInput } from './inputs'
import { authorizeActionUpdate, upsertAction } from './service'

builder.mutationField('campaignBlockUpdateNavigateToRegionAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignNavigateToRegionActionRef,
    nullable: false,
    description:
      'Point a button at a Campaign Region’s page, carrying the visitor’s Page Language. The button’s one action becomes this navigation; any link or scroll target it had is cleared. Deleting the region later sets the target null and the button renders static.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live block.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.\n- BAD_USER_INPUT (field: `regionId`): not a region of this campaign.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({
        type: CampaignNavigateToRegionActionInput,
        required: true
      })
    },
    resolve: async (_parent, { id, input }, context) => {
      const block = await authorizeActionUpdate(String(id), context.user)
      const region = await prisma.campaignRegion.findFirst({
        where: { id: String(input.regionId), campaignId: block.campaignId },
        select: { id: true }
      })
      if (region == null)
        throw badUserInput(
          'regionId must be a region of this campaign',
          'regionId'
        )
      return await upsertAction(block, { regionId: region.id })
    }
  })
)

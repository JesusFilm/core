import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { CampaignRef } from './campaign'

builder.mutationField('campaignDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Hard-delete a Campaign. Cascades through `CampaignJourney` and `CampaignMedia` rows; the underlying `Journey` rows are NOT deleted. Returns the deleted campaign (last canonical view).\n\nAuth: caller must be a member of the campaign's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the campaign's team.",
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: { id: true, teamId: true }
      })
      if (campaign == null) {
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: campaign.teamId }))) {
        throw new GraphQLError('user is not allowed to delete campaign', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      return await prisma.campaign.delete({ ...query, where: { id } })
    }
  })
)

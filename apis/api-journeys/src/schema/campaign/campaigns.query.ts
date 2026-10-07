import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { Action, campaignAcl } from './campaign.acl'

builder.queryField('campaigns', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "List a team's Campaigns, draft and published, newest first.\n\nAuth: campaign Read — any member or manager of the team.\n\nErrors:\n- NOT_FOUND: the team does not exist.\n- FORBIDDEN: caller is not in the team.",
    type: [CampaignRef],
    nullable: false,
    args: {
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const teamId = String(args.teamId)
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { userTeams: true }
      })
      if (team == null)
        throw new GraphQLError('team not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Read, { team }, context.user))
        throw new GraphQLError('user is not allowed to view campaigns', {
          extensions: { code: 'FORBIDDEN' }
        })
      return await prisma.campaign.findMany({
        ...query,
        where: { teamId },
        orderBy: { createdAt: 'desc' }
      })
    }
  })
)

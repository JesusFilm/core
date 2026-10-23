import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { campaignAcl } from './campaign.acl'
import { forbidden, notFound } from './errors'

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
      if (team == null) throw notFound('team not found')
      if (!campaignAcl(Action.Read, { team }, context.user))
        throw forbidden('user is not allowed to view campaigns')
      return await prisma.campaign.findMany({
        ...query,
        where: { teamId },
        orderBy: { createdAt: 'desc' }
      })
    }
  })
)

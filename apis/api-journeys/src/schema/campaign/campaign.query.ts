import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { CampaignRef } from './campaign'

builder.queryField('campaign', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Read a single Campaign by id. Returns both `draft` and `published` rows — use this for in-team authenticated reads. Anonymous viewers must use `campaignBySlug`, which only returns published campaigns.\n\nAuth: caller must be a member of the campaign's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the campaign's team.",
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      // Cheap {id, teamId} fetch for the auth check before paying for the
      // full nested selection.
      const auth = await prisma.campaign.findUnique({
        where: { id },
        select: { id: true, teamId: true }
      })
      if (auth == null) {
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: auth.teamId }))) {
        throw new GraphQLError('user is not allowed to read campaign', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      return await prisma.campaign.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  })
)

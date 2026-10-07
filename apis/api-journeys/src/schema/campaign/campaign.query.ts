import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'

builder.queryField('campaign', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Read one Campaign by id in its full admin shape, draft or published.\n\nAuth: campaign Read — any member or manager of the campaign's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.",
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: INCLUDE_CAMPAIGN_ACL
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Read, campaign, context.user))
        throw new GraphQLError('user is not allowed to view campaign', {
          extensions: { code: 'FORBIDDEN' }
        })
      return await prisma.campaign.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  })
)

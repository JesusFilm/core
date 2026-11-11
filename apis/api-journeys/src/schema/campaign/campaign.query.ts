import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { authorizeCampaign } from './authorizeCampaign'
import { CampaignRef } from './campaign'

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
      await authorizeCampaign(id, 'view', context.user)
      return await prisma.campaign.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  })
)

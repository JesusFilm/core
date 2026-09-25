import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'

builder.queryField('campaigns', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isInTeam: String(args.teamId)
      }
    }))
    .prismaField({
      description:
        'List all Campaigns owned by a team — both `draft` and `published` rows — ordered by `createdAt` descending.\n\nAuth: caller must be a member of the requested team.',
      type: [CampaignRef],
      nullable: false,
      args: {
        teamId: t.arg({
          type: 'ID',
          required: true,
          description: 'Owning team. Caller must be a member.'
        })
      },
      resolve: async (query, _parent, args) =>
        await prisma.campaign.findMany({
          ...query,
          where: { teamId: String(args.teamId) },
          orderBy: { createdAt: 'desc' }
        })
    })
)

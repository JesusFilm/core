import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { CampaignRef } from './campaign'

builder.mutationField('campaignUnpublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Transition a `published` campaign back to `draft`. `publishedAt` is intentionally NOT cleared. Idempotent on an already-draft campaign.\n\nAuth: caller must be a member of the campaign's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the campaign's team.",
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: { id: true, teamId: true, status: true }
      })
      if (campaign == null) {
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: campaign.teamId }))) {
        throw new GraphQLError('user is not allowed to unpublish campaign', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      try {
        return await prisma.$transaction(async (tx) => {
          if (campaign.status === 'published') {
            await tx.campaign.updateMany({
              where: { id, status: 'published' },
              data: { status: 'draft' }
            })
          }
          return await tx.campaign.findUniqueOrThrow({
            ...query,
            where: { id }
          })
        })
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new GraphQLError('campaign not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        throw error
      }
    }
  })
)

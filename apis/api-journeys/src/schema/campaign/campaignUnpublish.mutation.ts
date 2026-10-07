import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import {
  campaignPagePaths,
  enqueueCampaignRevalidation
} from './revalidateCampaign'

builder.mutationField('campaignUnpublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Move a `published` Campaign back to `draft`. `publishedAt` is kept: it means "first went live", not "currently live". Idempotent: an already-draft campaign is a no-op. Queues on-demand revalidation so the public pages stop serving within the publish bound; the linked journeys and their QR codes keep working at their own addresses.\n\nAuth: campaign Manage — a manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not a manager of the team.',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: { ...INCLUDE_CAMPAIGN_ACL, regions: true }
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Manage, campaign, context.user))
        throw new GraphQLError('user is not allowed to unpublish campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      try {
        const { result, transitioned } = await prisma.$transaction(
          async (tx) => {
            let transitioned = false
            if (campaign.status === 'published') {
              const { count } = await tx.campaign.updateMany({
                where: { id, status: 'published' },
                data: { status: 'draft' }
              })
              transitioned = count > 0
            }
            const result = await tx.campaign.findUniqueOrThrow({
              ...query,
              where: { id }
            })
            return { result, transitioned }
          }
        )
        if (transitioned)
          await enqueueCampaignRevalidation(campaignPagePaths(campaign))
        return result
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        )
          throw new GraphQLError('campaign not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        throw error
      }
    }
  })
)

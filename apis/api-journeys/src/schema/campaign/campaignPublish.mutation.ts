import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import {
  campaignPagePaths,
  enqueueCampaignRevalidation
} from './revalidateCampaign'

builder.mutationField('campaignPublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Move a `draft` Campaign to `published`, stamping `publishedAt` on the first publish only. Idempotent: an already-published campaign is a no-op (no state change, no re-stamp). Queues on-demand revalidation of the landing page and every region page; nothing on a campaign is locked by its status.\n\nAuth: campaign Manage — a manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not a manager of the team.',
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
        throw new GraphQLError('user is not allowed to publish campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      // Atomic transition + canonical re-read, as the Template Gallery Page
      // pair does: the `status: 'draft'` predicate makes updateMany a no-op for
      // a caller that lost the race, and `publishedAt` is set on the winning
      // transition only. An already-published campaign skips the write.
      try {
        const { result, transitioned } = await prisma.$transaction(
          async (tx) => {
            let transitioned = false
            if (campaign.status !== 'published') {
              const { count } = await tx.campaign.updateMany({
                where: { id, status: 'draft' },
                data: { status: 'published', publishedAt: new Date() }
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

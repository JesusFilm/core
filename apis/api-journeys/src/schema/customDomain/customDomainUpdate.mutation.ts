import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'
import {
  campaignLanguageTags,
  campaignPagePaths,
  enqueueCampaignRevalidation
} from '../campaign/revalidateCampaign'

import { CustomDomainRef } from './customDomain'
import { canAccessCustomDomain } from './customDomain.acl'
import { CustomDomainUpdateInput } from './inputs'
import { updateTeamShortLinks } from './service'

/**
 * A Campaign Root change moves the domain form of the old and new campaign
 * and flips the canonical link on their root-domain form, so every page of
 * both is revalidated in both forms.
 */
async function revalidateCampaignRootChange(
  campaignIds: Array<string | null>,
  hostname: string
): Promise<void> {
  const ids = campaignIds.filter((campaignId) => campaignId != null)
  if (ids.length === 0) return
  const campaigns = await prisma.campaign.findMany({
    where: { id: { in: ids } },
    include: { regions: true }
  })
  const paths = await Promise.all(
    campaigns.map(async (campaign) =>
      campaignPagePaths({
        ...campaign,
        hostnames: [hostname],
        languageTags: await campaignLanguageTags(campaign.id)
      })
    )
  )
  await enqueueCampaignRevalidation(paths.flat())
}

builder.mutationField('customDomainUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: CustomDomainRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CustomDomainUpdateInput, required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const { id, input } = args

      const customDomain = await prisma.customDomain.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })

      if (customDomain == null) {
        throw new GraphQLError('custom domain not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessCustomDomain(Action.Update, customDomain, context.user)) {
        throw new GraphQLError('user is not allowed to update custom domain', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      let journeyCollectionUpdate:
        | { connect: { id: string } }
        | { disconnect: true }
        | undefined

      if ('journeyCollectionId' in input) {
        if (input.journeyCollectionId == null) {
          journeyCollectionUpdate = { disconnect: true }
        } else {
          const journeyCollection = await prisma.journeyCollection.findFirst({
            where: {
              id: input.journeyCollectionId,
              teamId: customDomain.teamId
            }
          })

          if (journeyCollection == null) {
            throw new GraphQLError(
              'journey collection not found for this custom domain team',
              { extensions: { code: 'FORBIDDEN' } }
            )
          }

          journeyCollectionUpdate = {
            connect: { id: input.journeyCollectionId }
          }
        }
      }

      let campaignUpdate:
        | { connect: { id: string } }
        | { disconnect: true }
        | undefined

      if ('campaignId' in input) {
        if (input.campaignId == null) {
          campaignUpdate = { disconnect: true }
        } else {
          const campaign = await prisma.campaign.findFirst({
            where: { id: String(input.campaignId), teamId: customDomain.teamId }
          })

          if (campaign == null)
            throw new GraphQLError(
              'campaign not found for this custom domain team',
              { extensions: { code: 'FORBIDDEN' } }
            )

          campaignUpdate = { connect: { id: campaign.id } }
        }
      }

      const updated = await prisma.customDomain.update({
        ...query,
        where: { id },
        data: {
          routeAllTeamJourneys: input.routeAllTeamJourneys ?? undefined,
          journeyCollection: journeyCollectionUpdate,
          campaign: campaignUpdate
        }
      })

      if (campaignUpdate != null) {
        const nextCampaignId =
          'connect' in campaignUpdate ? campaignUpdate.connect.id : null
        if (nextCampaignId !== customDomain.campaignId)
          await revalidateCampaignRootChange(
            [customDomain.campaignId, nextCampaignId],
            customDomain.name
          )
      }

      const routeAllChanged =
        input.routeAllTeamJourneys != null &&
        input.routeAllTeamJourneys !== customDomain.routeAllTeamJourneys
      const journeyCollectionChanged =
        'journeyCollectionId' in input &&
        (input.journeyCollectionId ?? null) !== customDomain.journeyCollectionId
      if (routeAllChanged || journeyCollectionChanged)
        await updateTeamShortLinks(customDomain.teamId)

      return updated
    }
  })
)

import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { Action, campaignAcl } from '../campaign.acl'
import { CampaignRegionCountryRef } from '../campaignRegionCountry'

import { INCLUDE_CAMPAIGN_REGION_ACL } from './service'

builder.mutationField('campaignRegionCountryRemove', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: CampaignRegionCountryRef,
    nullable: false,
    description:
      'Remove a country chip from a Campaign Region’s card and renumber the remaining chips. Returns the deleted row.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id: rawId }, context) => {
      const id = String(rawId)
      const row = await prisma.campaignRegionCountry.findUnique({
        where: { id },
        include: { region: { include: INCLUDE_CAMPAIGN_REGION_ACL } }
      })
      if (row == null)
        throw new GraphQLError('region country not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Update, row.region.campaign, context.user))
        throw new GraphQLError('user is not allowed to update region', {
          extensions: { code: 'FORBIDDEN' }
        })

      return await prisma.$transaction(async (tx) => {
        const deleted = await tx.campaignRegionCountry.delete({
          where: { id }
        })
        const remaining = await tx.campaignRegionCountry.findMany({
          where: { regionId: row.regionId },
          orderBy: { order: 'asc' }
        })
        await Promise.all(
          remaining.map(
            async (country, order) =>
              await tx.campaignRegionCountry.update({
                where: { id: country.id },
                data: { order }
              })
          )
        )
        await touchCampaign(tx, row.region.campaignId)
        return deleted
      })
    }
  })
)

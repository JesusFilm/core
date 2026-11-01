import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { CampaignRegionCountryRef } from '../campaignRegionCountry'
import { lockCampaignStructure, touchCampaign } from '../campaignWrite'
import { notFound } from '../errors'
import { renumber } from '../order'

import { authorizeRegionUpdate } from './service'

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
        select: { regionId: true }
      })
      if (row == null) throw notFound('region country not found')
      const region = await authorizeRegionUpdate(row.regionId, context.user)

      return await prisma.$transaction(async (tx) => {
        await lockCampaignStructure(tx, region.campaignId)
        const deleted = await tx.campaignRegionCountry.delete({
          where: { id }
        })
        const remaining = await tx.campaignRegionCountry.findMany({
          where: { regionId: row.regionId },
          orderBy: { order: 'asc' }
        })
        await renumber(
          remaining,
          async (country, order) =>
            await tx.campaignRegionCountry.update({
              where: { id: country.id },
              data: { order }
            })
        )
        await touchCampaign(tx, region.campaignId)
        return deleted
      })
    }
  })
)

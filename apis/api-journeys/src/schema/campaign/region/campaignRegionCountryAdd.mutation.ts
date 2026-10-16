import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRegionCountryRef } from '../campaignRegionCountry'
import { fetchCountry } from '../gatewayClient'
import { assertRegionCountries, badUserInput } from '../validation'

import { authorizeRegionUpdate } from './service'

builder.mutationField('campaignRegionCountryAdd', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a country chip to a Campaign Region’s card, appended last in chip order. The id is an api-languages Country id; flag and translated name resolve from the owner.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: regionId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `countryId`): not an api-languages country, already on the region, or the region already has 250 countries.',
    type: CampaignRegionCountryRef,
    nullable: false,
    args: {
      regionId: t.arg({ type: 'ID', required: true }),
      countryId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (
      query,
      _parent,
      { regionId: rawRegionId, countryId: rawCountryId },
      context
    ) => {
      const regionId = String(rawRegionId)
      const countryId = String(rawCountryId)
      const region = await authorizeRegionUpdate(regionId, context.user)
      const existing = await prisma.campaignRegionCountry.findMany({
        where: { regionId },
        orderBy: { order: 'asc' }
      })
      assertRegionCountries([
        ...existing.map((country) => country.countryId),
        countryId
      ])
      const country = await fetchCountry(countryId)
      if (country == null)
        throw badUserInput('countryId must be an existing country', 'countryId')

      return await prisma.$transaction(async (tx) => {
        const created = await tx.campaignRegionCountry.create({
          ...query,
          data: { regionId, countryId, order: existing.length }
        })
        await touchCampaign(tx, region.campaignId)
        return created
      })
    }
  })
)

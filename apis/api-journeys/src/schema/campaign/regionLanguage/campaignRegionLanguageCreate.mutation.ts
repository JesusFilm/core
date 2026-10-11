import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { fetchLanguage } from '../gatewayClient'
import { authorizeRegionUpdate } from '../region/service'
import { badUserInput } from '../validation'

builder.mutationField('campaignRegionLanguageCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a Share Language to a Campaign Region, appended last in selector order with no journey yet (an Unlinked Language). The id is an api-languages Language id; a share language need not be a campaign language. Paste a journey through `campaignRegionLanguageUpdate` to link it.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: regionId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not an api-languages language, or already on the region.',
    type: CampaignRegionLanguageRef,
    nullable: false,
    args: {
      regionId: t.arg({ type: 'ID', required: true }),
      languageId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (
      query,
      _parent,
      { regionId: rawRegionId, languageId: rawLanguageId },
      context
    ) => {
      const regionId = String(rawRegionId)
      const languageId = String(rawLanguageId)
      const region = await authorizeRegionUpdate(regionId, context.user)
      const existing = await prisma.campaignRegionLanguage.findMany({
        where: { regionId },
        orderBy: { order: 'asc' }
      })
      if (existing.some((row) => row.languageId === languageId))
        throw badUserInput(
          `languageId ${languageId} is already a share language of this region`,
          'languageId'
        )
      const language = await fetchLanguage(languageId)
      if (language == null)
        throw badUserInput(
          'languageId must be an existing language',
          'languageId'
        )

      return await prisma.$transaction(async (tx) => {
        const created = await tx.campaignRegionLanguage.create({
          ...query,
          data: { regionId, languageId, order: existing.length }
        })
        await touchCampaign(tx, region.campaignId)
        return created
      })
    }
  })
)

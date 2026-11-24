import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { CampaignRegionLanguageRef } from '../campaignRegionLanguage'
import { campaignWrite } from '../campaignWrite'
import { badUserInput } from '../errors'
import { fetchLanguage } from '../gatewayClient'
import { authorizeRegionUpdate } from '../region/service'
import { REGION_SHARE_LANGUAGES_MAX } from '../validation'

function alreadyAdded(languageId: string): GraphQLError {
  return badUserInput(
    `languageId ${languageId} is already a share language of this region`,
    'languageId'
  )
}

builder.mutationField('campaignRegionLanguageCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a Share Language to a Campaign Region, appended last in selector order with no journey yet (an Unlinked Language). The id is an api-languages Language id; a share language need not be a campaign language. Paste a journey through `campaignRegionLanguageUpdate` to link it.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: regionId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not an api-languages language, already on the region, or the region already has 20 share languages.',
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
        throw alreadyAdded(languageId)
      const language = await fetchLanguage(languageId)
      if (language == null)
        throw badUserInput(
          'languageId must be an existing language',
          'languageId'
        )

      return await campaignWrite(
        region.campaignId,
        { structure: true },
        async ({ tx }) => {
          const current = await tx.campaignRegionLanguage.findMany({
            where: { regionId },
            orderBy: { order: 'asc' }
          })
          if (current.some((row) => row.languageId === languageId))
            throw alreadyAdded(languageId)
          if (current.length >= REGION_SHARE_LANGUAGES_MAX)
            throw badUserInput(
              `a region has at most ${REGION_SHARE_LANGUAGES_MAX} share languages`,
              'languageId'
            )
          return await tx.campaignRegionLanguage.create({
            ...query,
            data: { regionId, languageId, order: current.length }
          })
        }
      )
    }
  })
)

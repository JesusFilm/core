import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { authorizeCampaign } from '../authorizeCampaign'
import {
  lockCampaign,
  lockCampaignLanguageRows,
  touchCampaign
} from '../block/service'
import { CampaignRef } from '../campaign'
import { badUserInput } from '../errors'
import { fetchLanguage } from '../gatewayClient'
import { enqueueLanguageRevalidation } from '../revalidateCampaign'
import { CAMPAIGN_LANGUAGES_MAX } from '../validation'

function alreadyAdded(): GraphQLError {
  return badUserInput(
    'languageId is already a language of this campaign',
    'languageId'
  )
}

builder.mutationField('campaignLanguageAdd', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a Page Language to a campaign: the `CampaignLanguage` row is appended at the end of the selector order. Not a Command. The Machine Translation into the new language is a separate run the editor starts.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not an api-languages language, already a language of this campaign, or the campaign already has 50 languages.\n\nOn a published campaign, queues on-demand revalidation of its pages.',
    type: CampaignRef,
    nullable: false,
    args: {
      campaignId: t.arg({ type: 'ID', required: true }),
      languageId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const campaignId = String(args.campaignId)
      const languageId = String(args.languageId)
      const campaign = await authorizeCampaign(
        campaignId,
        'update',
        context.user,
        {
          languages: true,
          regions: true,
          customDomains: true
        }
      )
      if (
        campaign.languages.some(
          (language) => language.languageId === languageId
        )
      )
        throw alreadyAdded()
      const language = await fetchLanguage(languageId)
      if (language == null)
        throw badUserInput(
          'languageId must be an existing language',
          'languageId'
        )

      const updated = await prisma.$transaction(async (tx) => {
        // A concurrent add appends at the same position: lock the campaign
        // row and append after what is committed now.
        await lockCampaignLanguageRows(tx, campaignId)
        await lockCampaign(tx, campaignId)
        const languages = await tx.campaignLanguage.findMany({
          where: { campaignId },
          orderBy: { order: 'asc' }
        })
        if (languages.some((row) => row.languageId === languageId))
          throw alreadyAdded()
        if (languages.length >= CAMPAIGN_LANGUAGES_MAX)
          throw badUserInput(
            `a campaign has at most ${CAMPAIGN_LANGUAGES_MAX} languages`,
            'languageId'
          )
        await tx.campaignLanguage.create({
          data: { campaignId, languageId, order: languages.length }
        })
        await touchCampaign(tx, campaignId)
        return await tx.campaign.findUniqueOrThrow({
          ...query,
          where: { id: campaignId }
        })
      })
      await enqueueLanguageRevalidation(campaign, languageId)
      return updated
    }
  })
)

import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { touchCampaign } from '../block/service'
import { CampaignRef } from '../campaign'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from '../campaign.acl'
import { fetchLanguage } from '../gatewayClient'
import { badUserInput } from '../validation'

builder.mutationField('campaignLanguageAdd', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Add a Page Language to a campaign: the `CampaignLanguage` row is appended at the end of the selector order. Not a Command. The machine-translation run into the new language is a separate mutation (the Translations ticket).\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `languageId`): not an api-languages language, or already a language of this campaign.',
    type: CampaignRef,
    nullable: false,
    args: {
      campaignId: t.arg({ type: 'ID', required: true }),
      languageId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const campaignId = String(args.campaignId)
      const languageId = String(args.languageId)
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { ...INCLUDE_CAMPAIGN_ACL, languages: true }
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Update, campaign, context.user))
        throw new GraphQLError('user is not allowed to update campaign', {
          extensions: { code: 'FORBIDDEN' }
        })
      if (
        campaign.languages.some(
          (language) => language.languageId === languageId
        )
      )
        throw badUserInput(
          'languageId is already a language of this campaign',
          'languageId'
        )
      const language = await fetchLanguage(languageId)
      if (language == null)
        throw badUserInput(
          'languageId must be an existing language',
          'languageId'
        )

      return await prisma.$transaction(async (tx) => {
        await tx.campaignLanguage.create({
          data: {
            campaignId,
            languageId,
            order: campaign.languages.length
          }
        })
        await touchCampaign(tx, campaignId)
        return await tx.campaign.findUniqueOrThrow({
          ...query,
          where: { id: campaignId }
        })
      })
    }
  })
)

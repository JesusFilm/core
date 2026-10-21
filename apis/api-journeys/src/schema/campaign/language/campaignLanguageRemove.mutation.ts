import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../../lib/auth/ability'
import { builder } from '../../builder'
import {
  lockCampaign,
  lockCampaignLanguageRows,
  touchCampaign
} from '../block/service'
import { CampaignRef } from '../campaign'
import { INCLUDE_CAMPAIGN_ACL, campaignAcl } from '../campaign.acl'
import { conflict } from '../errors'
import { renumber } from '../order'
import { enqueueLanguageRevalidation } from '../revalidateCampaign'

builder.mutationField('campaignLanguageRemove', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Remove a Page Language from a campaign and close the gap in the selector order. `Campaign.defaultLanguageId` is always one of its languages and a campaign always has at least one, so the default and the last language cannot be removed. Stored translations in that language are kept. Not a Command.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve, or the language is not one of its languages.\n- FORBIDDEN: caller is not in the team.\n- CONFLICT (field: `languageId`): the language is the campaign default, or its last language.\n\nOn a published campaign, queues on-demand revalidation of its pages, including the removed language’s.',
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
        include: {
          ...INCLUDE_CAMPAIGN_ACL,
          regions: true,
          customDomains: true
        }
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Update, campaign, context.user))
        throw new GraphQLError('user is not allowed to update campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      const updated = await prisma.$transaction(async (tx) => {
        // A concurrent default-language swap or removal can move the default
        // or the language list after the read above: lock the campaign row and
        // judge the removal against what is committed now.
        await lockCampaignLanguageRows(tx, campaignId)
        await lockCampaign(tx, campaignId)
        const current = await tx.campaign.findUnique({
          where: { id: campaignId },
          select: {
            defaultLanguageId: true,
            languages: { orderBy: { order: 'asc' } }
          }
        })
        if (current == null)
          throw new GraphQLError('campaign not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        const row = current.languages.find(
          (language) => language.languageId === languageId
        )
        if (row == null)
          throw new GraphQLError('language not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        if (languageId === current.defaultLanguageId)
          throw conflict(
            'languageId is the default language and cannot be removed',
            'languageId'
          )
        if (current.languages.length === 1)
          throw conflict(
            'languageId is the last language and cannot be removed',
            'languageId'
          )

        await tx.campaignLanguage.delete({ where: { id: row.id } })
        const remaining = current.languages.filter(
          (language) => language.id !== row.id
        )
        await renumber(remaining, async (language, order) =>
          language.order === order
            ? undefined
            : await tx.campaignLanguage.update({
                where: { id: language.id },
                data: { order }
              })
        )
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

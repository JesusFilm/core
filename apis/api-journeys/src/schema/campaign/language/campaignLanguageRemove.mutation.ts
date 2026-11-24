import { builder } from '../../builder'
import { authorizeCampaign } from '../authorizeCampaign'
import { CampaignRef } from '../campaign'
import { campaignWrite } from '../campaignWrite'
import { conflict, notFound } from '../errors'
import { renumber } from '../order'
import {
  queuePageSetChange,
  snapshotCampaignAddress
} from '../revalidateCampaign'

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
      await authorizeCampaign(campaignId, 'update', context.user)

      // A concurrent default-language swap or removal can move the default
      // or the language list after the read above: lock the campaign row and
      // judge the removal against what is committed now.
      return await campaignWrite(
        campaignId,
        { languageRows: true, campaignRow: true },
        async ({ tx, afterCommit }) => {
          const before = await snapshotCampaignAddress(tx, campaignId)
          const current = await tx.campaign.findUnique({
            where: { id: campaignId },
            select: {
              defaultLanguageId: true,
              languages: { orderBy: { order: 'asc' } }
            }
          })
          if (current == null) throw notFound('campaign not found')
          const row = current.languages.find(
            (language) => language.languageId === languageId
          )
          if (row == null) throw notFound('language not found')
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
          const after = await snapshotCampaignAddress(tx, campaignId)
          afterCommit(async () => await queuePageSetChange(before, after))
          return await tx.campaign.findUniqueOrThrow({
            ...query,
            where: { id: campaignId }
          })
        }
      )
    }
  })
)

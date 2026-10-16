import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import {
  deleteQrCodes,
  deleteShortLinks,
  findRegionQrCodes
} from './regionLanguage/service'
import {
  campaignLanguageTags,
  campaignPagePaths,
  enqueueCampaignRevalidation
} from './revalidateCampaign'

builder.mutationField('campaignDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Hard-delete a Campaign. A published campaign queues on-demand revalidation of its pages, so they stop serving within the publish bound. The database cascade removes its blocks, actions, pages, languages, theme, strings, regions and their rows; every Campaign QR Code of its Share Languages is deleted with its short link; a Custom Domain naming it as Campaign Root is released, and the linked journeys are untouched. Returns the deleted campaign as its last canonical view.\n\nAuth: campaign Delete — a manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not a manager of the team.',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const campaign = await prisma.campaign.findUnique({
        where: { id },
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
      if (!campaignAcl(Action.Delete, campaign, context.user))
        throw new GraphQLError('user is not allowed to delete campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      // The language rows cascade away with the campaign, so the pages to
      // purge are listed before the delete.
      const pagePaths =
        campaign.status === 'published'
          ? campaignPagePaths({
              ...campaign,
              hostnames: campaign.customDomains.map(({ name }) => name),
              languageTags: await campaignLanguageTags(id)
            })
          : []

      let shortLinkIds: string[] = []
      const deleted = await prisma.$transaction(async (tx) => {
        shortLinkIds = await deleteQrCodes(
          tx,
          await findRegionQrCodes(tx, { region: { campaignId: id } })
        )
        return await tx.campaign.delete({ ...query, where: { id } })
      })
      await deleteShortLinks(shortLinkIds)
      await enqueueCampaignRevalidation(pagePaths)
      return deleted
    }
  })
)

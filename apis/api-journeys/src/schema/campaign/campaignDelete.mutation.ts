import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import { deleteQrCodes, findRegionQrCodes } from './regionLanguage/service'

builder.mutationField('campaignDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Hard-delete a Campaign. The database cascade removes its blocks, actions, pages, languages, theme, strings, regions and their rows; every Campaign QR Code of its Share Languages is deleted with its short link; a Custom Domain naming it as Campaign Root is released, and the linked journeys are untouched. Returns the deleted campaign as its last canonical view.\n\nAuth: campaign Delete — a manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not a manager of the team.',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: INCLUDE_CAMPAIGN_ACL
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Delete, campaign, context.user))
        throw new GraphQLError('user is not allowed to delete campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      return await prisma.$transaction(async (tx) => {
        await deleteQrCodes(
          tx,
          await findRegionQrCodes(tx, { region: { campaignId: id } })
        )
        return await tx.campaign.delete({ ...query, where: { id } })
      })
    }
  })
)

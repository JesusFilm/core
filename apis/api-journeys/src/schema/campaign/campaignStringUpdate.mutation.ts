import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { touchCampaign } from './block/service'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import { CampaignStringRef } from './campaignString'
import { CampaignStringKey } from './enums'
import { TEXT_CAPS, assertLength } from './validation'

builder.mutationField('campaignStringUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Update the default-language wording of one Campaign String. The seventeen rows are seeded with the campaign and never deleted while it exists, so the string is addressed by its key. Translations are untouched; they go through `campaignTranslationSet` with `stringId`. A Command in the editor.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaign does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `value`): over 200 characters.',
    type: CampaignStringRef,
    nullable: false,
    args: {
      campaignId: t.arg({ type: 'ID', required: true }),
      key: t.arg({ type: CampaignStringKey, required: true }),
      value: t.arg.string({ required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const campaignId = String(args.campaignId)
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: INCLUDE_CAMPAIGN_ACL
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Update, campaign, context.user))
        throw new GraphQLError('user is not allowed to update campaign', {
          extensions: { code: 'FORBIDDEN' }
        })
      const value = assertLength(args.value, 'value', TEXT_CAPS.stringValue)

      return await prisma.$transaction(async (tx) => {
        const string = await tx.campaignString.update({
          ...query,
          where: { campaignId_key: { campaignId, key: args.key } },
          data: { value }
        })
        await touchCampaign(tx, campaignId)
        return string
      })
    }
  })
)

import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import { CampaignStatsRef } from './campaignStats'
import { getCampaignStats } from './stats/campaignStats'

builder.queryField('campaignStats', (t) =>
  t.field({
    description:
      "The Campaign's visitor stats from one cached Plausible sweep over every linked journey that is not deleted (draft, published and archived all count; a trashed or deleted journey does not), summed by the campaign's regions: total visitors and visitors by ISO alpha-2 country for the whole campaign and for each region. The server reads Plausible with the service key; the caller never does.\n\nAuth: a published campaign is readable by anyone, anonymous or authenticated; a draft only with campaign Read.\n\nErrors:\n- NOT_FOUND: id does not resolve, or the campaign is a draft the caller cannot read.\n- Plausible failure with nothing cached: the query errors; with a cached sweep, that sweep is served however old, and a stale one is refreshed in the background (a failed refresh is not retried for a few minutes). One journey's Plausible failure does not fail the sweep: that journey keeps its last rows, or counts as no visitors.",
    type: CampaignStatsRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const campaign = await prisma.campaign.findUnique({
        where: { id: String(args.id) },
        include: {
          ...INCLUDE_CAMPAIGN_ACL,
          regions: {
            orderBy: { order: 'asc' },
            include: { languages: { orderBy: { order: 'asc' } } }
          }
        }
      })
      const readable =
        campaign != null &&
        (campaign.status === 'published' ||
          (context.type === 'authenticated' &&
            campaignAcl(Action.Read, campaign, context.user)))
      if (!readable)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      return await getCampaignStats(campaign)
    }
  })
)

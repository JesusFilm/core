import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import {
  SLUG_MAX_LENGTH,
  SLUG_PATTERN
} from '../templateGalleryPage/generateUniqueSlug'

import { CampaignCountryStatsRef } from './campaignCountryStats'
import { getCampaignCountryStats } from './stats/getCampaignCountryStats'

// Public, unauthenticated. The Plausible token never leaves the server: the
// resolver aggregates on behalf of anonymous viewers, but only for PUBLISHED
// campaigns (the DB lookup runs before any Plausible call, so probing a draft
// or unknown slug costs one indexed read and no upstream request).
builder.queryField('campaignCountryStats', (t) =>
  t.field({
    type: CampaignCountryStatsRef,
    nullable: true,
    description:
      "Public country breakdown of a published campaign's share-journey traffic, aggregated server-side from Plausible. Returns null for unknown, draft or malformed slugs. Cached for a few minutes.",
    args: {
      slug: t.arg.string({ required: true })
    },
    resolve: async (_parent, args) => {
      const { slug } = args
      if (!SLUG_PATTERN.test(slug) || slug.length > SLUG_MAX_LENGTH) {
        return null
      }
      const campaign = await prisma.campaign.findFirst({
        where: { slug, status: 'published' },
        select: {
          id: true,
          teamId: true,
          statsFrom: true,
          journeys: {
            where: {
              role: 'share',
              journey: { deletedAt: null, status: 'published' }
            },
            select: {
              journeyId: true,
              journey: { select: { teamId: true, template: true } }
            }
          }
        }
      })
      if (campaign == null) return null

      const journeyIds = campaign.journeys
        .filter(
          (row) =>
            row.journey.teamId === campaign.teamId &&
            row.journey.template !== true
        )
        .map((row) => row.journeyId)

      return await getCampaignCountryStats({
        teamId: campaign.teamId,
        journeyIds,
        statsFrom: campaign.statsFrom
      })
    }
  })
)

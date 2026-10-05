import {
  JourneyStatus,
  Prisma,
  VideoBlockSource,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyRef } from './journey'

builder.queryField('journeysByVideo', (t) =>
  t.withAuth({ isPublisher: true }).prismaField({
    type: [JourneyRef],
    nullable: false,
    description: `Journeys that embed the given media video, for publishers
choosing a journey to link from an external surface (e.g. a YouTube
description CTA).

Matching is on the root video id stored by VideoBlocks whose source is
internal or unset — YouTube, Cloudflare and Mux blocks hold a provider id in
the same column and are never candidates, while blocks predating the source
column hold a media video id and are. When languageId is given it narrows to
blocks playing that variant; when omitted any variant of the video matches.

Only published, non-template journeys are returned: the caller needs a link
that a viewer can actually open. Results are not scoped to the publisher's
teams — the whole point is finding a journey they may not own — and are
ordered by unique visitor count descending, so the most viewed journey comes
first.`,
    args: {
      videoId: t.arg.id({ required: true }),
      languageId: t.arg.id({ required: false })
    },
    resolve: async (query, _parent, args) => {
      const videoBlockFilter: Prisma.BlockWhereInput = {
        typename: 'VideoBlock',
        videoId: args.videoId,
        deletedAt: null,
        // Block.source is nullable with no database default, so VideoBlocks
        // written before the column existed carry a media video id and no
        // source. `source: internal` alone silently drops them.
        OR: [{ source: VideoBlockSource.internal }, { source: null }]
      }
      if (args.languageId != null)
        videoBlockFilter.videoVariantLanguageId = args.languageId

      return await prisma.journey.findMany({
        ...query,
        where: {
          status: JourneyStatus.published,
          deletedAt: null,
          // Journey.template is nullable. `not: true` compiles to
          // NOT (template = true), which SQL's three-valued logic evaluates
          // to NULL — so legacy rows with no template value would be dropped.
          OR: [{ template: false }, { template: null }],
          blocks: { some: videoBlockFilter }
        },
        orderBy: [
          { journeyVisitors: { _count: 'desc' } },
          { publishedAt: 'desc' },
          { id: 'asc' }
        ]
      })
    }
  })
)

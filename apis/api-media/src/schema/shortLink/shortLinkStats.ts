import { builder } from '../builder'

import { getShortLinkStats } from './analytics'
import { ShortLinkStatsFilter } from './inputs'
import { ShortLinkStats } from './objects'

builder.queryFields((t) => ({
  shortLinkStats: t
    .withAuth({
      $any: { isPublisher: true, isShortLinkEditor: true, isValidInterop: true }
    })
    .field({
      type: ShortLinkStats,
      description:
        'redirect counts from the edge analytics store for a date range (zeros when analytics is not configured)',
      nullable: false,
      args: { filter: t.arg({ type: ShortLinkStatsFilter, required: true }) },
      resolve: async (_, { filter }) => await getShortLinkStats(filter)
    })
}))

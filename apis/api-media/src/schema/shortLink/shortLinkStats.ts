import { builder } from '../builder'
import { editorScopes } from './lib/access'

import { getShortLinkStats } from './analytics'
import { ShortLinkStatsFilter } from './inputs'
import { ShortLinkStats } from './objects'

builder.queryFields((t) => ({
  shortLinkStats: t
    .withAuth(editorScopes)
    .field({
      type: ShortLinkStats,
      description:
        'redirect counts from the edge analytics store for a date range (zeros when analytics is not configured)',
      nullable: false,
      args: { filter: t.arg({ type: ShortLinkStatsFilter, required: true }) },
      resolve: async (_, { filter }) => await getShortLinkStats(filter)
    })
}))

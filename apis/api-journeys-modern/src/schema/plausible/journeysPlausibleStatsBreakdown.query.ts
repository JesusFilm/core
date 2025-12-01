import { GraphQLError, GraphQLResolveInfo } from 'graphql'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { PlausibleStatsBreakdownFilter } from './inputs'
import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import { getMetrics } from './metrics'
import { PlausibleStatsResponseRef } from './plausible'
import { getJourneyStatsBreakdown } from './service'

builder.queryField('journeysPlausibleStatsBreakdown', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [PlausibleStatsResponseRef],
    description: `This endpoint allows you to break down your stats by some property.
If you are familiar with SQL family databases, this endpoint corresponds to
running \`GROUP BY\` on a certain property in your stats, then ordering by the
count.
Check out the [properties](https://plausible.io/docs/stats-api#properties)
section for a reference of all the properties you can use in this query.
This endpoint can be used to fetch data for \`Top sources\`, \`Top pages\`,
\`Top countries\` and similar reports.
Currently, it is only possible to break down on one property at a time.
Using a list of properties with one query is not supported. So if you want
a breakdown by both \`event:page\` and \`visit:source\` for example, you would
have to make multiple queries (break down on one property and filter on
 another) and then manually/programmatically group the results together in one
 report. This also applies for breaking down by time periods. To get a daily
 breakdown for every page, you would have to break down on \`event:page\` and
 make multiple queries for each date.`,
    args: {
      where: t.arg({
        type: PlausibleStatsBreakdownFilter,
        required: true
      }),
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        required: false,
        defaultValue: 'slug'
      })
    },
    resolve: async (
      _parent,
      { id, idType, where },
      context,
      info: GraphQLResolveInfo
    ) => {
      const journey = await loadJourneyOrThrow(id, normalizeIdType(idType))

      if (!ability(Action.Update, subject('Journey', journey), context.user)) {
        throw new GraphQLError('User is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const metrics = getMetrics(info)
      return getJourneyStatsBreakdown(journey.id, {
        metrics,
        ...where
      })
    }
  })
)

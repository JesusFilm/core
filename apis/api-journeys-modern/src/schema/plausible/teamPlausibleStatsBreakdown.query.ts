import { GraphQLError, GraphQLResolveInfo } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { PlausibleStatsBreakdownFilter } from './inputs'
import { getMetrics } from './metrics'
import { PlausibleStatsResponseRef } from './plausible'
import { getTeamStatsBreakdown } from './service'

const PUBLIC_TEAM_ID_ALLOWLIST: ReadonlySet<string> = new Set([
  'f73ae713-cf8e-446b-8cb2-45228edfd69e'
])

builder.queryField('teamPlausibleStatsBreakdown', (t) =>
  t.field({
    type: [PlausibleStatsResponseRef],
    nullable: false,
    description: `Aggregated Plausible breakdown stats across every journey in a
team. Per-journey results are fetched in parallel from the Plausible
\`breakdown\` endpoint and then merged by the \`property\` field, summing
numeric metrics (e.g. visitors, pageviews, events). Results are ordered by
visitors descending. The set of metrics returned is inferred from the
requested GraphQL selection set, mirroring \`journeysPlausibleStatsBreakdown\`.

This endpoint is unauthenticated, but only a fixed allowlist of team IDs is
permitted. Requests for any other team return a \`FORBIDDEN\` error.`,
    args: {
      teamId: t.arg.id({ required: true }),
      where: t.arg({
        type: PlausibleStatsBreakdownFilter,
        required: true
      })
    },
    resolve: async (
      _parent,
      { teamId, where },
      _context,
      info: GraphQLResolveInfo
    ) => {
      const teamIdString = String(teamId)
      if (!PUBLIC_TEAM_ID_ALLOWLIST.has(teamIdString)) {
        throw new GraphQLError('Team is not allowed', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const journeys = await prisma.journey.findMany({
        where: { teamId: teamIdString },
        select: { id: true }
      })

      if (journeys.length === 0) return []

      const metrics = getMetrics(info)
      return getTeamStatsBreakdown(
        journeys.map((journey) => journey.id),
        { metrics, ...where }
      )
    }
  })
)

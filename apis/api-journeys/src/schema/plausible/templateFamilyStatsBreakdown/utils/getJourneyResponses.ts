import { GraphQLError } from 'graphql'
import { z } from 'zod'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

const customDateRangeSchema = z
  .tuple([z.iso.date(), z.iso.date()])
  .refine(([start, end]) => start <= end)

function getResponseEventFilter(
  dateRange?: string | null
): Prisma.EventWhereInput | undefined {
  if (dateRange == null) return undefined
  const parsed = customDateRangeSchema.safeParse(dateRange.split(','))
  if (!parsed.success) {
    throw new GraphQLError('Invalid custom date range', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }
  const [start, end] = parsed.data
  const endExclusive = new Date(`${end}T00:00:00.000Z`)
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)
  // Plausible sites use UTC. Include the entire selected end date.
  return {
    typename: 'TextResponseSubmissionEvent',
    createdAt: {
      gte: new Date(`${start}T00:00:00.000Z`),
      lt: endExclusive
    }
  }
}

/**
 * Gets the count of text responses for each journey.
 * Counts each responding visitor once per journey. With a custom date range,
 * requires a text-response event in that inclusive UTC interval.
 *
 * @param journeysOrIds - Array of journeys or journey IDs to get response counts for
 * @returns Array of journey IDs with response counts. Returns an empty array if input is empty or if no journeys have responses.
 */
export async function getJourneysResponses(
  journeysOrIds: JourneyWithAcl[] | string[],
  dateRange?: string | null
): Promise<{ journeyId: string; visitors: number }[]> {
  if (journeysOrIds.length === 0) {
    return []
  }

  const journeyIds =
    typeof journeysOrIds[0] === 'string'
      ? (journeysOrIds as string[])
      : (journeysOrIds as JourneyWithAcl[]).map((journey) => journey.id)

  const responseEventFilter = getResponseEventFilter(dateRange)
  const results = await prisma.journeyVisitor.groupBy({
    by: ['journeyId'],
    where: {
      journeyId: { in: journeyIds },
      lastTextResponse: { not: null },
      ...(responseEventFilter != null
        ? { events: { some: responseEventFilter } }
        : {})
    },
    _count: {
      journeyId: true
    }
  })

  return results.map((result) => ({
    journeyId: result.journeyId,
    visitors: result._count.journeyId
  }))
}

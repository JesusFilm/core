import { GraphQLError } from 'graphql'

import { CampaignJourneyRole, Prisma } from '@core/prisma/journeys/client'

// Upper bound per role. Bounds the Plausible `event:page` filter string the
// public country-stats query builds from the share list (~43 bytes per id, so
// 100 ids stay well under common 8 KB proxy limits).
export const CAMPAIGN_MAX_JOURNEYS_PER_ROLE = 100

export function assertJourneyListSize(
  ids: readonly string[] | null | undefined,
  field: 'shareJourneyIds' | 'templateJourneyIds'
): void {
  if (ids == null) return
  if (ids.length > CAMPAIGN_MAX_JOURNEYS_PER_ROLE) {
    throw new GraphQLError(
      `${field} may contain at most ${CAMPAIGN_MAX_JOURNEYS_PER_ROLE} journeys`,
      { extensions: { code: 'BAD_USER_INPUT', field } }
    )
  }
}

/**
 * Filter input journeyIds to those that:
 *   - belong to the given teamId
 *   - match the role's template rule (`template` → template === true;
 *     `share` → template is false or null)
 *   - are not soft-deleted
 *
 * Drops invalid IDs silently and preserves the caller's order — mirrors the
 * TemplateGalleryPage `filterToTeamTemplates` UX. Published status is NOT
 * required at write time: drafts can be attached, and the public projection
 * hides them at read time.
 */
export async function filterToTeamJourneys(
  tx: Prisma.TransactionClient,
  teamId: string,
  journeyIds: readonly string[],
  role: CampaignJourneyRole
): Promise<{ validIds: string[] }> {
  if (journeyIds.length === 0) return { validIds: [] }

  const dedup = [...new Set(journeyIds)]
  const found = await tx.journey.findMany({
    where: {
      id: { in: dedup },
      teamId,
      deletedAt: null,
      // `template` is a nullable Boolean; `NOT: { template: true }` would
      // exclude NULL rows in SQL, so spell the share rule out explicitly.
      ...(role === 'template'
        ? { template: true }
        : { OR: [{ template: false }, { template: null }] })
    },
    select: { id: true }
  })
  const validSet = new Set(found.map((j) => j.id))
  return { validIds: dedup.filter((id) => validSet.has(id)) }
}

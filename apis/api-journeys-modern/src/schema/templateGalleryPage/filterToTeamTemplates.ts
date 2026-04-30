import { Prisma } from '@core/prisma/journeys/client'

/**
 * Filter input journeyIds to those that:
 *   - belong to the given teamId
 *   - have template === true (today's product rule; relax here when cross-team templates ship)
 *
 * Drops invalid IDs silently — mirrors legacy `journeyCollectionCreate` UX. The
 * `droppedCount` is returned so the caller MAY surface it to the admin UI.
 *
 * This helper is the single point where the cross-team rule lives. To allow
 * cross-team templates later, edit only this function.
 */
export async function filterToTeamTemplates(
  tx: Prisma.TransactionClient,
  teamId: string,
  journeyIds: string[]
): Promise<{ validIds: string[]; droppedCount: number }> {
  if (journeyIds.length === 0) return { validIds: [], droppedCount: 0 }

  const dedup = [...new Set(journeyIds)]
  const found = await tx.journey.findMany({
    // `deletedAt: null` honors the project-wide soft-delete convention so
    // soft-deleted journeys can never be added as gallery templates.
    where: { id: { in: dedup }, teamId, template: true, deletedAt: null },
    select: { id: true }
  })
  const validSet = new Set(found.map((j) => j.id))
  const validIds = dedup.filter((id) => validSet.has(id))

  return { validIds, droppedCount: dedup.length - validIds.length }
}

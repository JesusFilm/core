import { GraphQLError } from 'graphql'

import { Prisma } from '@core/prisma/journeys/client'

import { applyContiguousOrder } from './applyContiguousOrder'

/**
 * Membership rules shared by the link / move / remove mutations, the
 * `journeyIds` branch of `templateGalleryPageUpdate`, and page deletion.
 *
 * A journey may belong to many pages. Exactly one of those memberships is
 * its *home* (`isHome: true`); the rest are *links*. Home is presentational
 * only — nothing behaves differently for a home vs a link — but the rules
 * must be applied consistently so the admin always has one crisp card:
 *
 *  - the first membership a journey gains becomes its home;
 *  - a membership keeps its role when moved between pages;
 *  - removing the home promotes the oldest remaining link.
 *
 * Every helper below expects the caller to already be inside a
 * `prisma.$transaction` holding `lockJourney` for the journey (and
 * `lockPage` for each page it writes to) so concurrent mutations on the
 * same journey serialize and cannot produce two homes.
 */

/**
 * Per-journey row lock. Serializes every membership change for one journey
 * so "does this journey already have a home?" cannot be answered stale by a
 * concurrent transaction. Caller MUST be inside a transaction.
 */
export async function lockJourney(
  tx: Prisma.TransactionClient,
  journeyId: string
): Promise<void> {
  await tx.$queryRaw`
    SELECT 1 FROM "Journey"
    WHERE id = ${journeyId}
    FOR UPDATE
  `
}

/**
 * Re-reads `pageId`'s rows in display order and writes them back at
 * contiguous orders 0..N-1. Caller must hold `lockPage` on the page.
 */
export async function renumberPage(
  tx: Prisma.TransactionClient,
  pageId: string
): Promise<void> {
  const rows = await tx.templateGalleryPageTemplate.findMany({
    where: { templateGalleryPageId: pageId },
    orderBy: { order: 'asc' },
    select: { id: true }
  })
  await applyContiguousOrder(tx, pageId, rows)
}

/**
 * Validates that `journeyId` is a live, template-flagged journey owned by
 * `teamId`. Runs inside the caller's transaction so a concurrent
 * template-flag flip or soft-delete cannot slip past it.
 */
export async function assertTeamTemplate(
  tx: Prisma.TransactionClient,
  journeyId: string,
  teamId: string
): Promise<void> {
  const journey = await tx.journey.findUnique({
    where: { id: journeyId },
    select: { id: true, teamId: true, template: true, deletedAt: true }
  })
  if (journey == null || journey.deletedAt != null) {
    throw new GraphQLError('journey not found', {
      extensions: { code: 'NOT_FOUND', field: 'journeyId' }
    })
  }
  if (journey.template !== true) {
    throw new GraphQLError('journey is not a template', {
      extensions: { code: 'BAD_USER_INPUT', field: 'journeyId' }
    })
  }
  if (journey.teamId !== teamId) {
    throw new GraphQLError('journey does not belong to the target team', {
      extensions: { code: 'FORBIDDEN', field: 'journeyId' }
    })
  }
}

/**
 * Appends `journeyId` to the end of `pageId`. The new row is the journey's
 * home when it has none yet, otherwise a link. Idempotent: returns `false`
 * (no write) when the journey is already on the page.
 *
 * Caller must hold `lockJourney(journeyId)` and `lockPage(pageId)`.
 */
export async function addMembership(
  tx: Prisma.TransactionClient,
  pageId: string,
  journeyId: string
): Promise<boolean> {
  const existing = await tx.templateGalleryPageTemplate.findUnique({
    where: {
      templateGalleryPageId_journeyId: {
        templateGalleryPageId: pageId,
        journeyId
      }
    },
    select: { id: true }
  })
  if (existing != null) return false

  const home = await tx.templateGalleryPageTemplate.findFirst({
    where: { journeyId, isHome: true },
    select: { id: true }
  })
  const maxOrder = await tx.templateGalleryPageTemplate.aggregate({
    where: { templateGalleryPageId: pageId },
    _max: { order: true }
  })
  await tx.templateGalleryPageTemplate.create({
    data: {
      templateGalleryPageId: pageId,
      journeyId,
      order: (maxOrder._max.order ?? -1) + 1,
      isHome: home == null
    }
  })
  await renumberPage(tx, pageId)
  return true
}

export interface RemoveMembershipResult {
  /** False when the journey was not on the page (nothing written). */
  removed: boolean
  /**
   * The page whose link was promoted to home, or null when the removed row
   * was a link, or was the home with no links left.
   */
  promotedPageId: string | null
}

/**
 * Removes `journeyId` from `pageId`. When the removed row was the home and
 * links remain elsewhere, the oldest link becomes the new home.
 *
 * Caller must hold `lockJourney(journeyId)` and `lockPage(pageId)`. The
 * promoted page is only updated in place (no reorder), so it needs no lock.
 */
export async function removeMembership(
  tx: Prisma.TransactionClient,
  pageId: string,
  journeyId: string
): Promise<RemoveMembershipResult> {
  const row = await tx.templateGalleryPageTemplate.findUnique({
    where: {
      templateGalleryPageId_journeyId: {
        templateGalleryPageId: pageId,
        journeyId
      }
    },
    select: { id: true, isHome: true }
  })
  if (row == null) return { removed: false, promotedPageId: null }

  await tx.templateGalleryPageTemplate.delete({ where: { id: row.id } })
  await renumberPage(tx, pageId)

  if (!row.isHome) return { removed: true, promotedPageId: null }
  return {
    removed: true,
    promotedPageId: await promoteOldestLink(tx, journeyId)
  }
}

/**
 * Makes the journey's oldest link its home. Returns that link's page id, or
 * null when the journey has no links. Caller must hold `lockJourney`.
 */
export async function promoteOldestLink(
  tx: Prisma.TransactionClient,
  journeyId: string
): Promise<string | null> {
  const next = await tx.templateGalleryPageTemplate.findFirst({
    where: { journeyId, isHome: false },
    // `id` as a tiebreak so two links created in the same millisecond
    // resolve deterministically.
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: { id: true, templateGalleryPageId: true }
  })
  if (next == null) return null
  await tx.templateGalleryPageTemplate.update({
    where: { id: next.id },
    data: { isHome: true }
  })
  return next.templateGalleryPageId
}

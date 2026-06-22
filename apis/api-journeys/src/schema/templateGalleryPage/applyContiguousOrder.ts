import { Prisma } from '@core/prisma/journeys/client'

/**
 * Page-level row lock to serialize concurrent reorder/assign mutations on
 * the same page. Without this, two transactions both running per-row stage
 * updates can collide on the (templateGalleryPageId, order) UNIQUE
 * constraint when staging rows to overlapping sentinel values. The lock
 * is held until the surrounding transaction commits or rolls back.
 *
 * Caller MUST already be inside a `prisma.$transaction` — `FOR UPDATE`
 * outside a transaction releases the lock immediately.
 */
export async function lockPage(
  tx: Prisma.TransactionClient,
  pageId: string
): Promise<void> {
  await tx.$queryRaw`
    SELECT 1 FROM "TemplateGalleryPage"
    WHERE id = ${pageId}
    FOR UPDATE
  `
}

/**
 * Re-numbers a page's template rows to contiguous orders 0..N-1 in the
 * given array's order. Two-pass write: first stage every row to a unique
 * negative offset (`-(order) - 1_000_000`) so the per-row UNIQUE check on
 * (pageId, order) cannot see a transient duplicate, then place each row
 * at its final 0-indexed position.
 *
 * Caller MUST hold a `lockPage` on the page first; otherwise concurrent
 * mutations can both stage to overlapping negative sentinel ranges.
 */
export async function applyContiguousOrder(
  tx: Prisma.TransactionClient,
  pageId: string,
  rowsInOrder: ReadonlyArray<{ id: string }>
): Promise<void> {
  await tx.$executeRaw`
    UPDATE "TemplateGalleryPageTemplate"
    SET "order" = -("order") - 1000000
    WHERE "templateGalleryPageId" = ${pageId}
  `
  for (let i = 0; i < rowsInOrder.length; i++) {
    await tx.templateGalleryPageTemplate.update({
      where: { id: rowsInOrder[i].id },
      data: { order: i }
    })
  }
}

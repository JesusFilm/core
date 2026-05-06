import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { applyContiguousOrder, lockPage } from './applyContiguousOrder'
import { TemplateGalleryPageRef } from './templateGalleryPage'

// Re-reads `pageId`'s template rows in display order and writes them
// back at contiguous orders 0..N-1. Caller must hold a lockPage on the
// page first.
async function renumberPage(
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

builder.mutationField('templateGalleryPageAssignJourney', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Assign a journey to a TemplateGalleryPage, or unassign it. A journey may belong to at most one page at a time (single-membership invariant).\n\n- `pageId` set: move the journey into that page. The new row appends at the end of the target's display order; if the journey was already in another page (cross-page move) it is removed from the source page first. Both pages are renumbered to contiguous orders 0..N-1 after the change. Allowed on both `draft` and `published` pages.\n- `pageId` null/omitted: unassign — remove the journey from whatever page it is currently in. Returns null (idempotent no-op) if the journey is not in any page.\n- Same-page-already: idempotent return; no row changes.\n\nAuth: caller must be a member of the target page's team (and, on a cross-page move, also of the source page's team).\n\nErrors:\n- NOT_FOUND: target `pageId` does not resolve.\n- NOT_FOUND (field: `journeyId`): journey does not exist or is soft-deleted.\n- BAD_USER_INPUT (field: `journeyId`): journey is not flagged as a template.\n- FORBIDDEN: caller is not in the target page's team.\n- FORBIDDEN (field: `journeyId`): journey belongs to a different team than the target page.",
    type: TemplateGalleryPageRef,
    nullable: true,
    args: {
      journeyId: t.arg({
        type: 'ID',
        required: true,
        description:
          'The journey to assign or unassign. Must be a non-deleted, template-flagged journey owned by the target page\'s team (when assigning).'
      }),
      // pageId omitted/null → unassign the journey from whatever collection
      // it is currently in (returning the journey to the flat template list).
      pageId: t.arg({
        type: 'ID',
        required: false,
        description:
          'Target page id. Omit or pass `null` to unassign the journey from whatever page currently owns it (returning it to the flat template list). When set, the journey is moved into this page (and removed from any current source page in the same transaction).'
      })
    },
    resolve: async (query, _parent, args, context) => {
      const journeyId = String(args.journeyId)
      const pageId = args.pageId != null ? String(args.pageId) : null

      return await prisma.$transaction(async (tx) => {
        // Single-membership invariant: a journey may belong to at most one
        // TemplateGalleryPage. We always look up the existing assignment
        // first so that both assign-when-in-other-collection and unassign
        // share the same "find the source row, remove it" branch.
        const existing = await tx.templateGalleryPageTemplate.findFirst({
          where: { journeyId },
          select: { id: true, templateGalleryPageId: true }
        })

        if (pageId == null) {
          // UNASSIGN
          if (existing == null) {
            // Idempotent no-op — journey was not in any collection.
            return null
          }
          await lockPage(tx, existing.templateGalleryPageId)
          const sourcePage = await tx.templateGalleryPage.findUniqueOrThrow({
            where: { id: existing.templateGalleryPageId },
            select: { id: true, teamId: true }
          })
          if (!(await isInTeam({ context, teamId: sourcePage.teamId }))) {
            throw new GraphQLError(
              'user is not allowed to modify template gallery page',
              { extensions: { code: 'FORBIDDEN' } }
            )
          }
          await tx.templateGalleryPageTemplate.delete({
            where: { id: existing.id }
          })
          // Renumber the source page so the orders that surface to the next
          // reorder are contiguous. Without this pass, repeated
          // assign/unassign churn leaves gaps (e.g. {0, 2, 4, 5}) and the
          // display-index protocol of templateGalleryPageReorderTemplate
          // can't reason about them.
          await renumberPage(tx, existing.templateGalleryPageId)
          return await tx.templateGalleryPage.findUniqueOrThrow({
            ...query,
            where: { id: existing.templateGalleryPageId }
          })
        }

        // ASSIGN
        // Lock all pages this transaction will touch in sorted order so
        // that two cross-page swaps (A → B and B → A racing) cannot
        // deadlock by locking in opposite orders.
        const sourcePageId =
          existing != null && existing.templateGalleryPageId !== pageId
            ? existing.templateGalleryPageId
            : null
        const pagesToLock = (
          sourcePageId != null ? [pageId, sourcePageId] : [pageId]
        ).sort()
        for (const id of pagesToLock) {
          await lockPage(tx, id)
        }

        const targetPage = await tx.templateGalleryPage.findUnique({
          where: { id: pageId },
          select: { id: true, teamId: true }
        })
        if (targetPage == null) {
          throw new GraphQLError('template gallery page not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        if (!(await isInTeam({ context, teamId: targetPage.teamId }))) {
          throw new GraphQLError(
            'user is not allowed to modify template gallery page',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }

        // Idempotent: already in this exact page.
        if (existing != null && existing.templateGalleryPageId === pageId) {
          return await tx.templateGalleryPage.findUniqueOrThrow({
            ...query,
            where: { id: pageId }
          })
        }

        // Validate the journey: must be a non-deleted template owned by the
        // same team as the target page. Validation runs in the same tx so
        // a concurrent template-flag flip / soft-delete cannot slip past it.
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
        if (journey.teamId !== targetPage.teamId) {
          throw new GraphQLError('journey does not belong to the target team', {
            extensions: { code: 'FORBIDDEN', field: 'journeyId' }
          })
        }

        // Cross-page move: drop from source and renumber it before
        // touching the target. Both writes are inside the same tx so a
        // failure rolls everything back.
        if (existing != null) {
          await tx.templateGalleryPageTemplate.delete({
            where: { id: existing.id }
          })
          await renumberPage(tx, existing.templateGalleryPageId)
        }

        // Append at the end of the target. The order chosen here is a
        // temporary placeholder — the renumber pass below collapses any
        // gaps left from earlier assign/unassign churn into a contiguous
        // 0..N-1 block, and the new row naturally lands at index N-1.
        const maxOrder = await tx.templateGalleryPageTemplate.aggregate({
          where: { templateGalleryPageId: pageId },
          _max: { order: true }
        })
        const nextOrder = (maxOrder._max.order ?? -1) + 1

        await tx.templateGalleryPageTemplate.create({
          data: { templateGalleryPageId: pageId, journeyId, order: nextOrder }
        })
        await renumberPage(tx, pageId)

        return await tx.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id: pageId }
        })
      })
    }
  })
)

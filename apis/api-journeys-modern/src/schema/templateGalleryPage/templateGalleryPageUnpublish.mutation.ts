import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageUnpublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Transition a `published` page back to `draft`. `publishedAt` is intentionally NOT cleared — the historical first-publish timestamp is preserved across unpublish/republish cycles. Idempotent: calling on an already-draft page is a no-op.\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve, or the page was deleted between the auth-fetch and the canonical re-read.\n- FORBIDDEN: caller is not in the page's team.",
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      id: t.arg({
        type: 'ID',
        required: true,
        description: 'Stable page identifier.'
      })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)

      const page = await prisma.templateGalleryPage.findUnique({
        where: { id },
        select: { id: true, teamId: true, status: true }
      })
      if (page == null) {
        throw new GraphQLError('template gallery page not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: page.teamId }))) {
        throw new GraphQLError(
          'user is not allowed to unpublish template gallery page',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }

      // Atomic transition + canonical re-read in one transaction. The
      // `status: 'published'` predicate on updateMany makes it a no-op for
      // any caller racing to also unpublish. `publishedAt` is intentionally
      // NOT cleared — we preserve the historical record of when the page
      // was first published. The public `templateGalleryPageBySlug` query
      // already filters `status: published` so the page automatically
      // becomes inaccessible to anonymous viewers.
      //
      // Idempotent re-unpublish: when status is already 'draft' we skip
      // updateMany and just re-read.
      try {
        const result = await prisma.$transaction(async (tx) => {
          if (page.status === 'published') {
            await tx.templateGalleryPage.updateMany({
              where: { id, status: 'published' },
              data: { status: 'draft' }
            })
          }
          return await tx.templateGalleryPage.findUniqueOrThrow({
            ...query,
            where: { id }
          })
        })
        // Evict any cached `templateGalleryPageBySlug` entries — including
        // the just-cached published entity. The next read will repopulate
        // from DB as `null` (page is now draft), and that null entry stays
        // until the next typename-level invalidation (the republish call).
        await context.cache.invalidate([{ typename: 'TemplateGalleryPage' }])
        return result
      } catch (error) {
        // Edge case: the page was deleted between auth-fetch and re-read.
        // Surface as NOT_FOUND GraphQLError instead of leaking Prisma P2025.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new GraphQLError('template gallery page not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        throw error
      }
    }
  })
)

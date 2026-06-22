import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPagePublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Transition a `draft` page to `published`, stamping `publishedAt` on the first publish only. Idempotent: calling on an already-published page is a no-op (no state change, no re-stamp of `publishedAt`).\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve, or the page was deleted between the auth-fetch and the canonical re-read.\n- FORBIDDEN: caller is not in the page's team.",
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
        select: { id: true, teamId: true, status: true, publishedAt: true }
      })
      if (page == null) {
        throw new GraphQLError('template gallery page not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: page.teamId }))) {
        throw new GraphQLError(
          'user is not allowed to publish template gallery page',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }

      // Atomic transition + canonical re-read in one transaction. The
      // `status: 'draft'` predicate on updateMany makes it a no-op for any
      // caller that lost the race; `publishedAt` is set on the winning
      // transition only — never re-stamped (monotonic). The re-read returns
      // the current row regardless of whether this caller won or lost.
      //
      // Idempotent re-publish: when status is already 'published' we skip
      // updateMany entirely and just re-read.
      try {
        return await prisma.$transaction(async (tx) => {
          if (page.status !== 'published') {
            await tx.templateGalleryPage.updateMany({
              where: { id, status: 'draft' },
              data: {
                status: 'published',
                publishedAt: new Date()
              }
            })
          }
          return await tx.templateGalleryPage.findUniqueOrThrow({
            ...query,
            where: { id }
          })
        })
      } catch (error) {
        // Edge case: the page was deleted between our auth-fetch and the
        // re-read. Surface as the same NOT_FOUND GraphQLError the earlier
        // existence check would have thrown — keep the client error shape
        // consistent instead of leaking a Prisma P2025 as an unwrapped 500.
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

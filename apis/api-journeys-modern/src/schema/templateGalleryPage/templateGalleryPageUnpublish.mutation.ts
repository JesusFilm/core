import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageUnpublish', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
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

      // Atomic transition: the `status: 'published'` predicate makes
      // updateMany a no-op for any caller racing to also unpublish (or for
      // a caller that arrived after the page was already drafted). Note:
      // `publishedAt` is intentionally NOT cleared — we preserve the
      // historical record of when the page was first published. The public
      // `templateGalleryPageBySlug` query already filters `status: published`
      // so the page automatically becomes inaccessible to anonymous viewers.
      //
      // Idempotent re-unpublish: when status is already 'draft' we skip
      // updateMany and return the canonical row.
      if (page.status === 'published') {
        await prisma.templateGalleryPage.updateMany({
          where: { id, status: 'published' },
          data: { status: 'draft' }
        })
      }

      try {
        return await prisma.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id }
        })
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

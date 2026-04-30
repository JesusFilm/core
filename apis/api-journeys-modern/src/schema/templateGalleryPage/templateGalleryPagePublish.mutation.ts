import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPagePublish', (t) =>
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

      // Idempotent: if already published, return unchanged.
      if (page.status === 'published') {
        return await prisma.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id }
        })
      }

      // First-publish-wins under concurrent calls. The `status: 'draft'`
      // predicate makes the update atomic — at most one of N concurrent
      // publishers matches a row to update. The losers' updateMany returns
      // count 0 and falls through to the same canonical-read path as a
      // re-publish, preserving the winner's publishedAt timestamp.
      const result = await prisma.templateGalleryPage.updateMany({
        where: { id, status: 'draft' },
        data: {
          status: 'published',
          publishedAt: new Date()
        }
      })
      if (result.count === 0) {
        // Another publisher won the race between our findUnique and update.
        // Return the canonical row with the winner's publishedAt.
        return await prisma.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id }
        })
      }
      return await prisma.templateGalleryPage.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  })
)

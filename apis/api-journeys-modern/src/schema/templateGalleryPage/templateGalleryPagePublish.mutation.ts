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

      // Idempotent: if already published, return unchanged. publishedAt is
      // monotonic — set on first publish only.
      if (page.status === 'published') {
        return await prisma.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id }
        })
      }

      return await prisma.templateGalleryPage.update({
        ...query,
        where: { id },
        data: {
          status: 'published',
          publishedAt: page.publishedAt ?? new Date()
        }
      })
    }
  })
)

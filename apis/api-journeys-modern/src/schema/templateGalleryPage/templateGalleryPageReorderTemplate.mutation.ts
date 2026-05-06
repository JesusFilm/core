import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { applyContiguousOrder, lockPage } from './applyContiguousOrder'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageReorderTemplate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      pageId: t.arg({ type: 'ID', required: true }),
      journeyId: t.arg({ type: 'ID', required: true }),
      // `order` is interpreted as a DISPLAY INDEX (0..total-1), not as an
      // absolute `order` column value. Existing orders may be gappy after
      // earlier assign/unassign churn; treating the input as a display
      // index keeps the protocol correct regardless.
      order: t.arg.int({ required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const pageId = String(args.pageId)
      const journeyId = String(args.journeyId)
      const newIndex = args.order

      return await prisma.$transaction(async (tx) => {
        await lockPage(tx, pageId)

        const page = await tx.templateGalleryPage.findUnique({
          where: { id: pageId },
          select: { id: true, teamId: true, status: true }
        })
        if (page == null) {
          throw new GraphQLError('template gallery page not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        if (!(await isInTeam({ context, teamId: page.teamId }))) {
          throw new GraphQLError(
            'user is not allowed to modify template gallery page',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }
        if (page.status === 'published') {
          throw new GraphQLError(
            'cannot reorder templates on a published page',
            { extensions: { code: 'CONFLICT', field: 'status' } }
          )
        }

        const rows = await tx.templateGalleryPageTemplate.findMany({
          where: { templateGalleryPageId: pageId },
          orderBy: { order: 'asc' },
          select: { id: true, journeyId: true }
        })

        const sourceIndex = rows.findIndex((r) => r.journeyId === journeyId)
        if (sourceIndex < 0) {
          throw new GraphQLError(
            'journey is not in this template gallery page',
            {
              extensions: { code: 'BAD_USER_INPUT', field: 'journeyId' }
            }
          )
        }
        if (newIndex < 0 || newIndex >= rows.length) {
          throw new GraphQLError('order is out of range', {
            extensions: { code: 'BAD_USER_INPUT', field: 'order' }
          })
        }
        if (sourceIndex === newIndex) {
          return await tx.templateGalleryPage.findUniqueOrThrow({
            ...query,
            where: { id: pageId }
          })
        }

        const reordered = [...rows]
        const [moving] = reordered.splice(sourceIndex, 1)
        reordered.splice(newIndex, 0, moving)

        await applyContiguousOrder(tx, pageId, reordered)

        return await tx.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id: pageId }
        })
      })
    }
  })
)

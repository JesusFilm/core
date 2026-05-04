import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageReorderTemplate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      pageId: t.arg({ type: 'ID', required: true }),
      journeyId: t.arg({ type: 'ID', required: true }),
      order: t.arg.int({ required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const pageId = String(args.pageId)
      const journeyId = String(args.journeyId)
      const newOrder = args.order

      return await prisma.$transaction(async (tx) => {
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
        // Reorder is a structural edit; published collections are read-only on
        // the public renderer and the frontend gates the UI, but enforce here
        // so a direct mutation call cannot bypass the gate.
        if (page.status === 'published') {
          throw new GraphQLError(
            'cannot reorder templates on a published page',
            { extensions: { code: 'CONFLICT', field: 'status' } }
          )
        }

        const moving = await tx.templateGalleryPageTemplate.findUnique({
          where: {
            templateGalleryPageId_journeyId: {
              templateGalleryPageId: pageId,
              journeyId
            }
          },
          select: { id: true, order: true }
        })
        if (moving == null) {
          throw new GraphQLError(
            'journey is not in this template gallery page',
            {
              extensions: { code: 'BAD_USER_INPUT', field: 'journeyId' }
            }
          )
        }

        const total = await tx.templateGalleryPageTemplate.count({
          where: { templateGalleryPageId: pageId }
        })
        if (newOrder < 0 || newOrder >= total) {
          throw new GraphQLError('order is out of range', {
            extensions: { code: 'BAD_USER_INPUT', field: 'order' }
          })
        }

        if (moving.order === newOrder) {
          return await tx.templateGalleryPage.findUniqueOrThrow({
            ...query,
            where: { id: pageId }
          })
        }

        // Stage the moving row to a temporary, page-unique negative value so
        // the window-shift below cannot collide with it. The
        // (templateGalleryPageId, order) unique index is NOT deferrable
        // (plain `@@unique`), so a direct `SET order = order ± 1` over the
        // affected window would violate the constraint mid-statement at the
        // boundary. -1 is safe: orders are always non-negative integers.
        await tx.templateGalleryPageTemplate.update({
          where: { id: moving.id },
          data: { order: -1 }
        })

        if (moving.order < newOrder) {
          // Move down: rows in (oldOrder, newOrder] shift left by 1.
          await tx.$executeRaw`
            UPDATE "TemplateGalleryPageTemplate"
            SET "order" = "order" - 1
            WHERE "templateGalleryPageId" = ${pageId}
              AND "order" > ${moving.order}
              AND "order" <= ${newOrder}
          `
        } else {
          // Move up: rows in [newOrder, oldOrder) shift right by 1.
          await tx.$executeRaw`
            UPDATE "TemplateGalleryPageTemplate"
            SET "order" = "order" + 1
            WHERE "templateGalleryPageId" = ${pageId}
              AND "order" >= ${newOrder}
              AND "order" < ${moving.order}
          `
        }

        await tx.templateGalleryPageTemplate.update({
          where: { id: moving.id },
          data: { order: newOrder }
        })

        return await tx.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id: pageId }
        })
      })
    }
  })
)

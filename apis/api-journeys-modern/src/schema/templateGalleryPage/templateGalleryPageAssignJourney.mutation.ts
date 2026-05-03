import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageAssignJourney', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: TemplateGalleryPageRef,
    nullable: true,
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      // pageId omitted/null → unassign the journey from whatever collection
      // it is currently in (returning the journey to the flat template list).
      pageId: t.arg({ type: 'ID', required: false })
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
          return await tx.templateGalleryPage.findUniqueOrThrow({
            ...query,
            where: { id: existing.templateGalleryPageId }
          })
        }

        // ASSIGN
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

        // Single-membership: drop the existing row before inserting the new
        // one. Both writes happen inside the same tx so a failure cleans up.
        if (existing != null) {
          await tx.templateGalleryPageTemplate.delete({
            where: { id: existing.id }
          })
        }

        // Append at the end of the target page's existing ordering. Orders
        // need not be contiguous — only unique within the page (unique index
        // `(templateGalleryPageId, order)`).
        const maxOrder = await tx.templateGalleryPageTemplate.aggregate({
          where: { templateGalleryPageId: pageId },
          _max: { order: true }
        })
        const nextOrder = (maxOrder._max.order ?? -1) + 1

        await tx.templateGalleryPageTemplate.create({
          data: { templateGalleryPageId: pageId, journeyId, order: nextOrder }
        })

        return await tx.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id: pageId }
        })
      })
    }
  })
)

import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { lockPage } from './applyContiguousOrder'
import { lockJourney, removeMembership, renumberPage } from './membership'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageRemoveJourney', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Remove a journey from a TemplateGalleryPage. When the removed membership was the journey's home and links remain on other pages, the oldest link becomes the new home. Returns every page that changed: the page removed from and, when a promotion happened, the page that now holds the home. Idempotent: an empty list when the journey was not on the page.\n\nWhen `pageId` is omitted the journey is removed from every page it belongs to (used when a template is archived or trashed). Returns the pages it was removed from.\n\nAuth: caller must be a member of each affected page's team.\n\nErrors:\n- NOT_FOUND: `pageId` does not resolve.\n- FORBIDDEN: caller is not in an affected page's team.",
    type: [TemplateGalleryPageRef],
    nullable: false,
    args: {
      journeyId: t.arg({
        type: 'ID',
        required: true,
        description: 'The journey to remove.'
      }),
      pageId: t.arg({
        type: 'ID',
        required: false,
        description:
          'The page to remove the journey from. Omit to remove it from every page it belongs to.'
      })
    },
    resolve: async (query, _parent, args, context) => {
      const journeyId = String(args.journeyId)

      if (args.pageId != null) {
        const pageId = String(args.pageId)
        const page = await prisma.templateGalleryPage.findUnique({
          where: { id: pageId },
          select: { id: true, teamId: true }
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

        return await prisma.$transaction(async (tx) => {
          await lockJourney(tx, journeyId)
          await lockPage(tx, pageId)
          const { removed, promotedPageId } = await removeMembership(
            tx,
            pageId,
            journeyId
          )
          if (!removed) return []
          const changedPageIds =
            promotedPageId != null ? [pageId, promotedPageId] : [pageId]
          return await tx.templateGalleryPage.findMany({
            ...query,
            where: { id: { in: changedPageIds } }
          })
        })
      }

      // Remove from every page. Membership rows are read outside the
      // transaction only to find the pages to authorize and lock; the
      // deletion itself re-reads under the journey lock.
      const rows = await prisma.templateGalleryPageTemplate.findMany({
        where: { journeyId },
        select: { templateGalleryPage: { select: { id: true, teamId: true } } }
      })
      if (rows.length === 0) return []
      const teamIds = new Set(rows.map((row) => row.templateGalleryPage.teamId))
      for (const teamId of teamIds) {
        if (!(await isInTeam({ context, teamId }))) {
          throw new GraphQLError(
            'user is not allowed to modify template gallery page',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }
      }
      const pageIds = [
        ...new Set(rows.map((row) => row.templateGalleryPage.id))
      ].sort()

      return await prisma.$transaction(async (tx) => {
        await lockJourney(tx, journeyId)
        for (const pageId of pageIds) {
          await lockPage(tx, pageId)
        }
        await tx.templateGalleryPageTemplate.deleteMany({
          where: { journeyId, templateGalleryPageId: { in: pageIds } }
        })
        for (const pageId of pageIds) {
          await renumberPage(tx, pageId)
        }
        return await tx.templateGalleryPage.findMany({
          ...query,
          where: { id: { in: pageIds } }
        })
      })
    }
  })
)

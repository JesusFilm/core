import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { lockPage } from './applyContiguousOrder'
import {
  assertTeamTemplate,
  lockJourney,
  removeMembership,
  renumberPage
} from './membership'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageMoveJourney', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Move a journey's membership from one TemplateGalleryPage to another. The row keeps its role: moving the home makes the destination the home, moving a link keeps it a link. The row appends at the end of the destination's display order and both pages are renumbered to contiguous orders 0..N-1. If the journey is already on the destination, the source membership is simply removed (promoting the oldest link when the source was the home). Returns every page that changed: the source, the destination, and any page whose link was promoted to home. Allowed on both `draft` and `published` pages.\n\nAuth: caller must be a member of both pages' team.\n\nErrors:\n- NOT_FOUND: `fromPageId` or `toPageId` does not resolve.\n- BAD_USER_INPUT (field: `journeyId`): journey is not a member of `fromPageId`, or is not flagged as a template.\n- NOT_FOUND (field: `journeyId`): journey does not exist or is soft-deleted.\n- FORBIDDEN: caller is not in a page's team, or the pages belong to different teams.\n- FORBIDDEN (field: `journeyId`): journey belongs to a different team than the pages.",
    type: [TemplateGalleryPageRef],
    nullable: false,
    args: {
      journeyId: t.arg({
        type: 'ID',
        required: true,
        description: 'The journey whose membership moves.'
      }),
      fromPageId: t.arg({
        type: 'ID',
        required: true,
        description: 'The page the journey currently belongs to.'
      }),
      toPageId: t.arg({
        type: 'ID',
        required: true,
        description: 'The page to move the journey to.'
      })
    },
    resolve: async (query, _parent, args, context) => {
      const journeyId = String(args.journeyId)
      const fromPageId = String(args.fromPageId)
      const toPageId = String(args.toPageId)

      const pages = await prisma.templateGalleryPage.findMany({
        where: { id: { in: [fromPageId, toPageId] } },
        select: { id: true, teamId: true }
      })
      const fromPage = pages.find((page) => page.id === fromPageId)
      const toPage = pages.find((page) => page.id === toPageId)
      if (fromPage == null || toPage == null) {
        throw new GraphQLError('template gallery page not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (fromPage.teamId !== toPage.teamId) {
        throw new GraphQLError('pages belong to different teams', {
          extensions: { code: 'FORBIDDEN' }
        })
      }
      if (!(await isInTeam({ context, teamId: toPage.teamId }))) {
        throw new GraphQLError(
          'user is not allowed to modify template gallery page',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }

      if (fromPageId === toPageId) {
        return await prisma.templateGalleryPage.findMany({
          ...query,
          where: { id: toPageId }
        })
      }

      return await prisma.$transaction(async (tx) => {
        await lockJourney(tx, journeyId)
        // Pages locked in sorted id order so two opposite moves (A→B and
        // B→A) racing cannot deadlock by locking in opposite orders.
        for (const id of [fromPageId, toPageId].sort()) {
          await lockPage(tx, id)
        }
        await assertTeamTemplate(tx, journeyId, toPage.teamId)

        const source = await tx.templateGalleryPageTemplate.findUnique({
          where: {
            templateGalleryPageId_journeyId: {
              templateGalleryPageId: fromPageId,
              journeyId
            }
          },
          select: { id: true }
        })
        if (source == null) {
          throw new GraphQLError('journey is not a member of the source page', {
            extensions: { code: 'BAD_USER_INPUT', field: 'journeyId' }
          })
        }

        const changedPageIds = new Set([fromPageId, toPageId])

        const alreadyOnTarget = await tx.templateGalleryPageTemplate.findUnique(
          {
            where: {
              templateGalleryPageId_journeyId: {
                templateGalleryPageId: toPageId,
                journeyId
              }
            },
            select: { id: true }
          }
        )
        if (alreadyOnTarget != null) {
          // Nothing to relocate — the destination already has the journey.
          // Dropping the source row is the whole move; the home rule may
          // hand the home to the destination (or another page).
          const { promotedPageId } = await removeMembership(
            tx,
            fromPageId,
            journeyId
          )
          if (promotedPageId != null) changedPageIds.add(promotedPageId)
        } else {
          // Relocate the row in place so `isHome` and `createdAt` travel
          // with it. Order is a placeholder past the destination's end;
          // the renumber passes collapse both pages to 0..N-1.
          const maxOrder = await tx.templateGalleryPageTemplate.aggregate({
            where: { templateGalleryPageId: toPageId },
            _max: { order: true }
          })
          await tx.templateGalleryPageTemplate.update({
            where: { id: source.id },
            data: {
              templateGalleryPageId: toPageId,
              order: (maxOrder._max.order ?? -1) + 1
            }
          })
          await renumberPage(tx, fromPageId)
          await renumberPage(tx, toPageId)
        }

        return await tx.templateGalleryPage.findMany({
          ...query,
          where: { id: { in: [...changedPageIds] } }
        })
      })
    }
  })
)

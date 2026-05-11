import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { applyContiguousOrder, lockPage } from './applyContiguousOrder'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageReorderTemplate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Reorder a single template within a TemplateGalleryPage by addressing the destination as a 0-based display index. The page is renumbered to contiguous orders 0..N-1 after the move so the next reorder sees a clean range. Allowed on both `draft` and `published` pages (the frontend gates the UX; the backend accepts unconditionally for symmetry with `templateGalleryPageUpdate` and `templateGalleryPageAssignJourney`).\n\nIdempotent: when the journey is already at the requested display index, the call is a no-op.\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: `pageId` does not resolve.\n- FORBIDDEN: caller is not in the page's team.\n- BAD_USER_INPUT (field: `journeyId`): journey is not currently a member of the page.\n- BAD_USER_INPUT (field: `order`): order is out of range; must satisfy `0 <= order < count(templates in page)`.",
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      pageId: t.arg({
        type: 'ID',
        required: true,
        description: 'Target template gallery page id.'
      }),
      journeyId: t.arg({
        type: 'ID',
        required: true,
        description:
          'The journey whose position is being changed. Must already be a member of the page; use `templateGalleryPageAssignJourney` to add a journey first.'
      }),
      // `order` is interpreted as a DISPLAY INDEX (0..total-1), not as an
      // absolute `order` column value. Existing orders may be gappy after
      // earlier assign/unassign churn; treating the input as a display
      // index keeps the protocol correct regardless.
      order: t.arg.int({
        required: true,
        description:
          "0-based display index in the page's CURRENT template list, NOT the stored `order` column value. Range: `0 <= order < count(templates in page)`. The underlying `order` column may be gappy from prior assign/unassign churn; the resolver translates the display index into the correct splice position and renumbers the page contiguously."
      })
    },
    resolve: async (query, _parent, args, context) => {
      const pageId = String(args.pageId)
      const journeyId = String(args.journeyId)
      const newIndex = args.order

      return await prisma.$transaction(async (tx) => {
        await lockPage(tx, pageId)

        const page = await tx.templateGalleryPage.findUnique({
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

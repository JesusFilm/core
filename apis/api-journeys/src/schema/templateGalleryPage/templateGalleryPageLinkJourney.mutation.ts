import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { lockPage } from './applyContiguousOrder'
import { addMembership, assertTeamTemplate, lockJourney } from './membership'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageLinkJourney', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Add a journey to a TemplateGalleryPage without removing it from any other page. The new row appends at the end of the page's display order and becomes the journey's home when it has none yet, otherwise a link (see `TemplateGalleryPage.memberships`). Idempotent: if the journey is already on the page nothing changes. Allowed on both `draft` and `published` pages.\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: `pageId` does not resolve.\n- NOT_FOUND (field: `journeyId`): journey does not exist or is soft-deleted.\n- BAD_USER_INPUT (field: `journeyId`): journey is not flagged as a template.\n- FORBIDDEN: caller is not in the page's team.\n- FORBIDDEN (field: `journeyId`): journey belongs to a different team than the page.",
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      journeyId: t.arg({
        type: 'ID',
        required: true,
        description:
          "The journey to add. Must be a non-deleted, template-flagged journey owned by the page's team."
      }),
      pageId: t.arg({
        type: 'ID',
        required: true,
        description: 'The page to add the journey to.'
      })
    },
    resolve: async (query, _parent, args, context) => {
      const journeyId = String(args.journeyId)
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
        // Journey lock first, then page lock — every membership mutation
        // takes locks in this order so they cannot deadlock each other.
        await lockJourney(tx, journeyId)
        await lockPage(tx, pageId)
        await assertTeamTemplate(tx, journeyId, page.teamId)
        await addMembership(tx, pageId, journeyId)
        return await tx.templateGalleryPage.findUniqueOrThrow({
          ...query,
          where: { id: pageId }
        })
      })
    }
  })
)

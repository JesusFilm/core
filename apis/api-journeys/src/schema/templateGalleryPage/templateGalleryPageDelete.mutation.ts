import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { lockPage } from './applyContiguousOrder'
import { lockJourney, promoteOldestLink } from './membership'
import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Hard-delete a TemplateGalleryPage. Cascades through `TemplateGalleryPageTemplate` join rows automatically; the underlying `Journey` rows are NOT deleted. Any journey whose home was on this page and that is linked elsewhere has its oldest link promoted to home first. Returns the deleted page (last canonical view).\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the page's team.",
    type: TemplateGalleryPageRef,
    nullable: false,
    args: {
      id: t.arg({
        type: 'ID',
        required: true,
        description: 'Stable page identifier.'
      })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)

      const page = await prisma.templateGalleryPage.findUnique({
        where: { id },
        select: { id: true, teamId: true }
      })
      if (page == null) {
        throw new GraphQLError('template gallery page not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: page.teamId }))) {
        throw new GraphQLError(
          'user is not allowed to delete template gallery page',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const homes = await tx.templateGalleryPageTemplate.findMany({
          where: { templateGalleryPageId: id, isHome: true },
          select: { journeyId: true },
          orderBy: { journeyId: 'asc' }
        })
        for (const { journeyId } of homes) {
          await lockJourney(tx, journeyId)
        }
        await lockPage(tx, id)
        // The rows on this page are about to cascade away; hand each home
        // to its journey's oldest link elsewhere so the journey keeps one.
        // The row on this page is left as-is (it is deleted below), and a
        // journey with no links simply ends up in no collection.
        for (const { journeyId } of homes) {
          await promoteOldestLink(tx, journeyId)
        }
        // Cascade deletes TemplateGalleryPageTemplate join rows automatically.
        return await tx.templateGalleryPage.delete({
          ...query,
          where: { id }
        })
      })
    }
  })
)

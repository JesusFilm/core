import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { lockPageMemberships, promoteOldestLink } from './membership'
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
        const memberships = await lockPageMemberships(tx, id)
        const homes = memberships.filter((row) => row.isHome)
        if (homes.length > 0) {
          // Clear the departing homes before promotion so no intermediate
          // write gives a journey two homes, even within this transaction.
          await tx.templateGalleryPageTemplate.deleteMany({
            where: { templateGalleryPageId: id, isHome: true }
          })
          for (const { journeyId } of homes) {
            await promoteOldestLink(tx, journeyId)
          }
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

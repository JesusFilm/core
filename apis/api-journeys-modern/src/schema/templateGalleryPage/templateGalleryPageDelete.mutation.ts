import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.mutationField('templateGalleryPageDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Hard-delete a TemplateGalleryPage. Cascades through `TemplateGalleryPageTemplate` join rows automatically; the underlying `Journey` rows are NOT deleted. Returns the deleted page (last canonical view).\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the page's team.",
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

      // Cascade deletes TemplateGalleryPageTemplate join rows automatically.
      const result = await prisma.templateGalleryPage.delete({
        ...query,
        where: { id }
      })
      // Evict any cached `templateGalleryPageBySlug` entries. After delete
      // the row is gone and the next read returns null, but the prior
      // cached entry (entity-ID-tagged) needs explicit eviction so the
      // next read sees the post-delete state.
      await context.cache.invalidate([{ typename: 'TemplateGalleryPage' }])
      return result
    }
  })
)

import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

// Authenticated read-by-id. Mirrors the auth pattern of
// templateGalleryPageDelete.mutation.ts: load the row by id to learn its
// teamId, then run isInTeam. Drafts must remain hidden from public traffic;
// anonymous viewers go through templateGalleryPageBySlug, which filters on
// `status: 'published'`.
builder.queryField('templateGalleryPage', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Read a single TemplateGalleryPage by id. Returns both `draft` and `published` rows — use this for in-team authenticated reads (e.g. an admin viewing or QA-ing their own team's drafts). Anonymous viewers must use `templateGalleryPageBySlug`, which only returns published pages.\n\nAuth: caller must be a member of the page's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the page's team.",
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
        ...query,
        where: { id }
      })
      if (page == null) {
        throw new GraphQLError('template gallery page not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: page.teamId }))) {
        throw new GraphQLError(
          'user is not allowed to read template gallery page',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }
      return page
    }
  })
)

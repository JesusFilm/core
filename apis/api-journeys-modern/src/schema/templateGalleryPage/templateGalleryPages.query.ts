import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { TemplateGalleryPageRef } from './templateGalleryPage'

builder.queryField('templateGalleryPages', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isInTeam: String(args.teamId)
      }
    }))
    .prismaField({
      description:
        'List all TemplateGalleryPages owned by a team — both `draft` and `published` rows — ordered by `createdAt` descending.\n\nAuth: caller must be a member of the requested team.',
      type: [TemplateGalleryPageRef],
      nullable: false,
      args: {
        teamId: t.arg({
          type: 'ID',
          required: true,
          description: 'Owning team. Caller must be a member.'
        })
      },
      resolve: async (query, _parent, args) =>
        await prisma.templateGalleryPage.findMany({
          ...query,
          where: { teamId: String(args.teamId) },
          orderBy: { createdAt: 'desc' }
        })
    })
)

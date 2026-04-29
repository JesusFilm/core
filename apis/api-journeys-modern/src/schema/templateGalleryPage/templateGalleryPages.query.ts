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
      type: [TemplateGalleryPageRef],
      nullable: false,
      args: {
        teamId: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args) =>
        await prisma.templateGalleryPage.findMany({
          ...query,
          where: { teamId: String(args.teamId) },
          orderBy: { createdAt: 'desc' }
        })
    })
)

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { VideoRole } from './enums/videoRole'

builder.externalRef('User', builder.selection<{ id: string }>('id')).implement({
  externalFields: (t) => ({
    id: t.id()
  }),
  fields: (t) => ({
    videoRoles: t.field({
      type: [VideoRole],
      authScopes: {
        isAuthenticated: true
      },
      resolve: async (data) => {
        return (
          (
            await prisma.videoAdminUser.findUnique({
              where: { id: data.id }
            })
          )?.roles ?? []
        )
      }
    })
  })
})

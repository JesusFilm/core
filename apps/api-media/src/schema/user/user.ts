import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { MediaRole } from './enums/mediaRole'

builder.externalRef('User', builder.selection<{ id: string }>('id')).implement({
  externalFields: (t) => ({
    id: t.id()
  }),
  fields: (t) => ({
    mediaUserRoles: t.field({
      type: [MediaRole],
      resolve: async (data) => {
        return (
          (
            await prisma.userMediaRole.findUnique({
              where: { id: data.id }
            })
          )?.roles ?? []
        )
      }
    })
  })
})

import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'

import { MediaRole } from './enums/mediaRole'

export const UserRef = builder.externalRef(
  'User',
  builder.selection<{ id: string }>('id')
)

UserRef.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false })
  }),
  fields: (t) => ({
    mediaUserRoles: t.field({
      type: [MediaRole],
      nullable: false,
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

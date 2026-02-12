import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'

import { MediaRole } from './enums/mediaRole'

export const AuthenticatedUserRef = builder.externalRef(
  'AuthenticatedUser',
  builder.selection<{ id: string }>('id')
)

AuthenticatedUserRef.implement({
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

export const UserRef = builder.unionType('User', {
  types: [AuthenticatedUserRef],
  resolveType: (user) => {
    return 'AuthenticatedUser'
  }
})

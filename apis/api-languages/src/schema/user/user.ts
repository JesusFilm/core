import { prisma } from '@core/prisma/languages/client'

import { builder } from '../builder'

import { LanguageRole } from './enums/languageRole'

const UserRef = builder.interfaceRef<{ id: string }>('User').implement({
  resolveType: () => 'AuthenticatedUser',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})

builder
  .externalRef('AuthenticatedUser', builder.selection<{ id: string }>('id'))
  .implement({
    interfaces: [UserRef],
    externalFields: (t) => ({
      id: t.id({ nullable: false })
    }),
    fields: (t) => ({
      languageUserRoles: t.field({
        type: [LanguageRole],
        nullable: false,
        resolve: async (data) => {
          return (
            (
              await prisma.userLanguageRole.findUnique({
                where: { userId: data.id }
              })
            )?.roles ?? []
          )
        }
      })
    })
  })

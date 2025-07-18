import { prisma } from '@core/prisma-languages/client'

import { builder } from '../builder'

import { LanguageRole } from './enums/languageRole'

builder.externalRef('User', builder.selection<{ id: string }>('id')).implement({
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

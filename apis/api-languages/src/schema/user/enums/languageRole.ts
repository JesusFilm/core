import { LanguageRole as PrismaLanguageRole } from '.prisma/api-languages-client'

import { builder } from '../../builder'

export const LanguageRole = builder.enumType(PrismaLanguageRole, {
  name: 'LanguageRole'
})

import { LanguageRole as PrismaLanguageRole } from '@core/prisma-languages/client'

import { builder } from '../../builder'

export const LanguageRole = builder.enumType(PrismaLanguageRole, {
  name: 'LanguageRole'
})

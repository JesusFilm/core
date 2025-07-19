import { ThemeName as PrismaThemeName } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../builder'

export const ThemeName = builder.enumType(PrismaThemeName, {
  name: 'ThemeName'
})

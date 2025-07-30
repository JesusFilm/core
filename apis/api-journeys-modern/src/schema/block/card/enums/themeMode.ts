import { ThemeMode as PrismaThemeMode } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../builder'

export const ThemeMode = builder.enumType(PrismaThemeMode, {
  name: 'ThemeMode'
})

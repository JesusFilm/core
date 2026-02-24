import { ThemeMode as PrismaThemeMode } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'

export const ThemeMode = builder.enumType(PrismaThemeMode, {
  name: 'ThemeMode'
})

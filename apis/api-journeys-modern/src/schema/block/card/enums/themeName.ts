import { ThemeName as PrismaThemeName } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'

export const ThemeName = builder.enumType(PrismaThemeName, {
  name: 'ThemeName'
})

import { VideoRedirectType as PrismaRedirectType } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const RedirectType = builder.enumType(PrismaRedirectType, {
  name: 'RedirectType'
})

import { VideoRedirectType as PrismaRedirectType } from '.prisma/api-media-client'

import { builder } from '../../builder'

export const RedirectType = builder.enumType(PrismaRedirectType, {
  name: 'RedirectType'
})

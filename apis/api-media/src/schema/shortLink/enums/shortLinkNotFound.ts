import { ShortLinkNotFound as PrismaShortLinkNotFound } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const ShortLinkNotFound = builder.enumType(PrismaShortLinkNotFound, {
  name: 'ShortLinkNotFound'
})

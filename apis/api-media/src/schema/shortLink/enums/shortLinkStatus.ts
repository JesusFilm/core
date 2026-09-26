import { ShortLinkStatus as PrismaShortLinkStatus } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const ShortLinkStatus = builder.enumType(PrismaShortLinkStatus, {
  name: 'ShortLinkStatus'
})

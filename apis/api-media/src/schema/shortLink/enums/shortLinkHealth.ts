import { ShortLinkHealth as PrismaShortLinkHealth } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const ShortLinkHealth = builder.enumType(PrismaShortLinkHealth, {
  name: 'ShortLinkHealth'
})

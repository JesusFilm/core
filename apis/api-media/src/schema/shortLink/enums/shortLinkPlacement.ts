import { ShortLinkPlacement as PrismaShortLinkPlacement } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const ShortLinkPlacement = builder.enumType(PrismaShortLinkPlacement, {
  name: 'ShortLinkPlacement'
})

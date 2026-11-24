import { ShortLinkAssetClass as PrismaShortLinkAssetClass } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const ShortLinkAssetClass = builder.enumType(PrismaShortLinkAssetClass, {
  name: 'ShortLinkAssetClass'
})

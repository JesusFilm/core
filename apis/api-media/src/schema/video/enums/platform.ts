import { Platform as PrismaPlatform } from '@core/prisma/media/client'

import { builder } from '../../builder'

export const Platform = builder.enumType(PrismaPlatform, {
  name: 'Platform'
})

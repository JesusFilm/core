import { Platform as PrismaPlatform } from '.prisma/api-media-client'

import { builder } from '../../builder'

export const Platform = builder.enumType(PrismaPlatform, {
  name: 'Platform'
})

import { Service as PrismaService } from '.prisma/api-media-client'

import { builder } from '../builder'

export const Service = builder.enumType(PrismaService, {
  name: 'Service'
})

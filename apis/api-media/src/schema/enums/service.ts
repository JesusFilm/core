import { Service as PrismaService } from '@core/prisma-media/client'

import { builder } from '../builder'

export const Service = builder.enumType(PrismaService, {
  name: 'Service'
})

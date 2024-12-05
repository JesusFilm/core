import { Services as PrismaServices } from '.prisma/api-media-client'

import { builder } from '../../builder'

export const Services = builder.enumType(PrismaServices, {
  name: 'Services'
})

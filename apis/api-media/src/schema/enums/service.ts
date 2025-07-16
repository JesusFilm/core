import {
  Service as PrismaService,
  VideoRedirectType as PrismaVideoRedirectType
} from '.prisma/api-media-client'

import { builder } from '../builder'

export const Service = builder.enumType(PrismaService, {
  name: 'Service'
})

export const VideoRedirectType = builder.enumType(PrismaVideoRedirectType, {
  name: 'VideoRedirectType'
})

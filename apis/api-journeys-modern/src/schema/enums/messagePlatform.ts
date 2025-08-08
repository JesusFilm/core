import { MessagePlatform as PrismaMessagePlatform } from '.prisma/api-journeys-modern-client'

import { builder } from '../builder'

export const MessagePlatform = builder.enumType(PrismaMessagePlatform, {
  name: 'MessagePlatform'
})

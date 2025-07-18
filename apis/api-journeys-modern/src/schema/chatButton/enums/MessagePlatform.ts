import { MessagePlatform as PrismaMessagePlatform } from '.prisma/api-journeys-client'

import { builder } from '../../builder'

export const MessagePlatform = builder.enumType(PrismaMessagePlatform, {
  name: 'MessagePlatform'
})

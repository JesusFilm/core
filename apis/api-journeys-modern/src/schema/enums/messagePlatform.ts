import { MessagePlatform as PrismaMessagePlatform } from '@core/prisma/journeys/client'

import { builder } from '../builder'

export const MessagePlatform = builder.enumType(PrismaMessagePlatform, {
  name: 'MessagePlatform'
})

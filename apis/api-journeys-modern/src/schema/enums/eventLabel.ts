import { EventLabel as PrismaEventLabel } from '@core/prisma/journeys/client'

import { builder } from '../builder'

export const BlockEventLabel = builder.enumType(PrismaEventLabel, {
  name: 'BlockEventLabel'
})



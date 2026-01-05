import { EventLabel as PrismaEventLabel } from '@core/prisma/journeys/client'

import { builder } from '../builder'

export const EventLabel = builder.enumType(PrismaEventLabel, {
  name: 'EventLabel'
})



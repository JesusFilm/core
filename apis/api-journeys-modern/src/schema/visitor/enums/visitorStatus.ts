import { VisitorStatus as PrismaVisitorStatus } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const VisitorStatus = builder.enumType(PrismaVisitorStatus, {
  name: 'VisitorStatus'
})

import { VisitorStatus as PrismaVisitorStatus } from '.prisma/api-journeys-modern-client'

import { builder } from '../../builder'

export const VisitorStatus = builder.enumType(PrismaVisitorStatus, {
  name: 'VisitorStatus'
})

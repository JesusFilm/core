import { IntegrationType as PrismaIntegrationType } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

export const IntegrationType = builder.enumType(PrismaIntegrationType, {
  name: 'IntegrationType'
})

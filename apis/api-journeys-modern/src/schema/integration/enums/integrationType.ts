import { IntegrationType as PrismaIntegrationType } from '.prisma/api-journeys-modern-client'

import { builder } from '../../builder'

export const IntegrationType = builder.enumType(PrismaIntegrationType, {
  name: 'IntegrationType'
})

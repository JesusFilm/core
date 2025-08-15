import { TextResponseType as PrismaTextResponseType } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../builder'

export const TextResponseType = builder.enumType(PrismaTextResponseType, {
  name: 'TextResponseType'
})

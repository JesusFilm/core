import { TextResponseType as PrismaTextResponseType } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'

export const TextResponseType = builder.enumType(PrismaTextResponseType, {
  name: 'TextResponseType'
})

import { DeviceType as PrismaDeviceType } from '@core/prisma/journeys/client'

import { builder } from '../../../../builder'

export const DeviceType = builder.enumType(PrismaDeviceType, {
  name: 'DeviceType'
})

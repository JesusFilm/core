import { DeviceType as PrismaDeviceType } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../../builder'

export const DeviceType = builder.enumType(PrismaDeviceType, {
  name: 'DeviceType'
})

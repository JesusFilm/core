import { DeviceType as PrismaDeviceType } from '.prisma/api-journeys-modern-client'

import { builder } from '../../../builder'

import { DeviceType } from './enums'

export const DeviceRef = builder
  .objectRef<{
    model?: string | null
    type?: PrismaDeviceType | null
    vendor?: string | null
  }>('Device')
  .implement({
    shareable: true,
    fields: (t) => ({
      model: t.string({
        nullable: true,
        resolve: (device) => device?.model || null
      }),
      type: t.field({
        type: DeviceType,
        nullable: true,
        resolve: (device) => device?.type || null
      }),
      vendor: t.string({
        nullable: true,
        resolve: (device) => device?.vendor || null
      })
    })
  })

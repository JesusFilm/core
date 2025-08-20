import { DeviceType as PrismaDeviceType } from '@core/prisma/journeys/client'

import { builder } from '../../builder'

// DeviceType enum
export const DeviceType = builder.enumType(PrismaDeviceType, {
  name: 'DeviceType'
})

// Create object refs for proper typing
const BrowserRef = builder.objectRef<{
  name?: string | null
  version?: string | null
}>('Browser')
const DeviceRef = builder.objectRef<{
  model?: string | null
  type?: PrismaDeviceType | null
  vendor?: string | null
}>('Device')
const OperatingSystemRef = builder.objectRef<{
  name?: string | null
  version?: string | null
}>('OperatingSystem')
const UserAgentRef = builder.objectRef<any>('UserAgent')

// Browser type
BrowserRef.implement({
  fields: (t) => ({
    name: t.string({
      nullable: true,
      resolve: (browser) => browser?.name || null
    }),
    version: t.string({
      nullable: true,
      resolve: (browser) => browser?.version || null
    })
  })
})

// Device type
DeviceRef.implement({
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

// OperatingSystem type
OperatingSystemRef.implement({
  fields: (t) => ({
    name: t.string({
      nullable: true,
      resolve: (os) => os?.name || null
    }),
    version: t.string({
      nullable: true,
      resolve: (os) => os?.version || null
    })
  })
})

// UserAgent type (subset of @types/ua-parser-js)
UserAgentRef.implement({
  fields: (t) => ({
    browser: t.field({
      type: BrowserRef,
      resolve: (userAgent) =>
        userAgent?.browser || { name: null, version: null }
    }),
    device: t.field({
      type: DeviceRef,
      resolve: (userAgent) =>
        userAgent?.device || { model: null, type: null, vendor: null }
    }),
    os: t.field({
      type: OperatingSystemRef,
      resolve: (userAgent) => userAgent?.os || { name: null, version: null }
    })
  })
})

// Export the refs
export { BrowserRef, DeviceRef, OperatingSystemRef, UserAgentRef }

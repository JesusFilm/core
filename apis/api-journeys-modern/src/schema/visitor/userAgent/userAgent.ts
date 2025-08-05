import { builder } from '../../builder'

import { BrowserRef } from './browser'
import { DeviceRef } from './device/device'
import { OperatingSystemRef } from './operatingSystem/operatingSystem'

export const UserAgentRef = builder.objectRef<any>('UserAgent').implement({
  shareable: true,
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

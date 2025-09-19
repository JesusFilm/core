import { builder } from '../../builder'

import { BrowserRef } from './browser'
import { DeviceRef } from './device/device'
import { OperatingSystemRef } from './operatingSystem/operatingSystem'

export const UserAgentRef = builder.objectRef<any>('UserAgent').implement({
  shareable: true,
  fields: (t) => ({
    browser: t.field({
      nullable: false,
      type: BrowserRef,
      resolve: (userAgent) =>
        userAgent?.browser || { name: null, version: null }
    }),
    device: t.field({
      nullable: false,
      type: DeviceRef,
      resolve: (userAgent) =>
        userAgent?.device || { model: null, type: null, vendor: null }
    }),
    os: t.field({
      nullable: false,
      type: OperatingSystemRef,
      resolve: (userAgent) => userAgent?.os || { name: null, version: null }
    })
  })
})

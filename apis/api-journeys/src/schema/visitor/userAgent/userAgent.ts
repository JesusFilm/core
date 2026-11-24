import { builder } from '../../builder'

import { BrowserRef } from './browser'
import { DeviceRef } from './device/device'
import { OperatingSystemRef } from './operatingSystem/operatingSystem'

export const UserAgentRef = builder
  .objectRef<{
    browser?: typeof BrowserRef.$inferType | null
    device?: typeof DeviceRef.$inferType | null
    os?: typeof OperatingSystemRef.$inferType | null
  }>('UserAgent')
  .implement({
    shareable: true,
    fields: (t) => ({
      browser: t.field({
        nullable: false,
        type: BrowserRef,
        /** Return the parsed browser or an object with empty browser fields. */
        resolve: (userAgent) =>
          userAgent?.browser || { name: null, version: null }
      }),
      device: t.field({
        nullable: false,
        type: DeviceRef,
        /** Return the parsed device or an object with empty device fields. */
        resolve: (userAgent) =>
          userAgent?.device || { model: null, type: null, vendor: null }
      }),
      os: t.field({
        nullable: false,
        type: OperatingSystemRef,
        /** Return the parsed OS or an object with empty OS fields. */
        resolve: (userAgent) => userAgent?.os || { name: null, version: null }
      })
    })
  })

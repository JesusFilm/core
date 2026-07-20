import { builder } from '../../../builder'

export const OperatingSystemRef = builder
  .objectRef<{
    name?: string | null
    version?: string | null
  }>('OperatingSystem')
  .implement({
    shareable: true,
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

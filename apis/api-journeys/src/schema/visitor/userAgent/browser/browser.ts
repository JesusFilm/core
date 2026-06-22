import { builder } from '../../../builder'

export const BrowserRef = builder
  .objectRef<{
    name?: string | null
    version?: string | null
  }>('Browser')
  .implement({
    shareable: true,
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

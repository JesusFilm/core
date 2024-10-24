import { builder } from '../../../builder'

export const CloudflareR2UpdateInput = builder.inputType(
  'CloudflareR2UpdateInput',
  {
    fields: (t) => ({
      id: t.string({ required: true }),
      fileName: t.string({ required: true }),
      videoId: t.string({ required: false })
    })
  }
)

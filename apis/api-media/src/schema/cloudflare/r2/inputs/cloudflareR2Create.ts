import { builder } from '../../../builder'

export const CloudflareR2CreateInput = builder.inputType(
  'CloudflareR2CreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      fileName: t.string({ required: true }),
      videoId: t.string({ required: true })
    })
  }
)

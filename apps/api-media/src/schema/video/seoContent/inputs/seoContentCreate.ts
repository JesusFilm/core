import { builder } from '../../../builder'

export const SeoContentCreateInput = builder.inputType(
  'SeoContentCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      videoId: t.string({ required: true }),
      title: t.string({ required: true }),
      description: t.string({ required: true }),
      keywords: t.string({ required: true }),
      content: t.string({ required: true }),
      primary: t.boolean({ required: true }),
      languageId: t.string({ required: true })
    })
  }
)

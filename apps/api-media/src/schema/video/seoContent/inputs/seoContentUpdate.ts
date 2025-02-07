import { builder } from '../../../builder'

export const SeoContentUpdateInput = builder.inputType(
  'SeoContentUpdateInput',
  {
    fields: (t) => ({
      id: t.string({ required: true }),
      title: t.string({ required: false }),
      description: t.string({ required: false }),
      keywords: t.string({ required: false }),
      content: t.string({ required: false }),
      primary: t.boolean({ required: false }),
      languageId: t.string({ required: false })
    })
  }
)

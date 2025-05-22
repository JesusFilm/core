import { builder } from '../builder'

export const Language = builder.externalRef(
  'Language',
  builder.selection<{ id: string }>('id')
)

Language.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})

import { builder } from '../builder'

export const Tag = builder.externalRef(
  'Tag',
  builder.selection<{ id: string }>('id')
)

Tag.implement({
  externalFields: (t) => ({ id: t.id() })
})

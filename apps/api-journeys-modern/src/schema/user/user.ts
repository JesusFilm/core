import { builder } from '../builder'

export const User = builder.externalRef(
  'User',
  builder.selection<{ id: string }>('id')
)

User.implement({
  externalFields: (t) => ({ id: t.id() })
})

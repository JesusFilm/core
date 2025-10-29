import { builder } from '../builder'

export const UserRef = builder.externalRef(
  'User',
  builder.selection<{ id: string }>('id')
)

UserRef.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false })
  })
})

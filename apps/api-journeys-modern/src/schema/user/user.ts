import { builder } from '../builder'

export const User = builder
  .externalRef('User', builder.selection<{ id: string }>('id'))
  .implement({
    externalFields: (t) => ({
      id: t.id({ nullable: false })
    })
  })

import { builder } from '../builder'

export const UserRef = builder.objectRef<{ id: string }>('User').implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})

builder.asEntity(UserRef, {
  interfaceObject: true,
  key: builder.selection<{ id: string }>('id'),
  resolveReference: (ref) => ref
})

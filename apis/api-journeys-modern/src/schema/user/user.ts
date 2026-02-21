import { builder } from '../builder'

export const UserRef = builder
  .interfaceRef<{ id: string }>('User')
  .implement({
    resolveType: (_user, context) => {
      if (context.type !== 'authenticated' || context.user.email == null) {
        return 'AnonymousUser'
      }
      return 'AuthenticatedUser'
    },
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false })
    })
  })

export const AuthenticatedUserRef = builder.externalRef(
  'AuthenticatedUser',
  builder.selection<{ id: string }>('id')
)

AuthenticatedUserRef.implement({
  interfaces: [UserRef],
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({})
})

export const AnonymousUserRef = builder.objectRef<{ id: string }>(
  'AnonymousUser'
)

AnonymousUserRef.implement({
  interfaces: [UserRef],
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})

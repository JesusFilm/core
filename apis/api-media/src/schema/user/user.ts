import { builder } from '../builder'

import { MediaRole } from './enums/mediaRole'

export const AuthenticatedUserRef = builder.externalRef(
  'AuthenticatedUser',
  builder.selection<{ id: string }>('id')
)

AuthenticatedUserRef.implement({
  externalFields: (t) => ({
    id: t.id({ nullable: false })
  }),
  fields: (t) => ({
    mediaUserRoles: t.field({
      type: [MediaRole],
      nullable: false,
      // Resolve from the request context so this field and the auth-scope
      // publisher check (builder.ts) can never disagree. Both derive from the
      // same UserMediaRole row, keyed by the Firebase uid (context.user.id via
      // UserMediaRole.userId). Looking the row up by the federation `id`
      // (api-users User.id) instead keys on a different column and returns a
      // different — often empty — result. See issue #9416.
      resolve: (_data, _args, context) =>
        context.type === 'authenticated' ? context.currentRoles : []
    })
  })
})

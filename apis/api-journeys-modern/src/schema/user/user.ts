import { builder } from '../builder'

// Define the federated AuthenticatedUser type reference - this should only be defined once
export const AuthenticatedUserRef = builder.externalRef(
  'AuthenticatedUser',
  builder.selection<{ id: string }>('id')
)

// Implement the external fields for the AuthenticatedUser type
AuthenticatedUserRef.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    // No additional fields needed - this is just the external reference
  })
})

// AnonymousUser is not a federation entity (no @key in api-users), so we define it locally
// to match the api-users schema for the User union
// Marked as shareable since it's also defined in api-users
export const AnonymousUserRef = builder.objectRef<{ id: string }>(
  'AnonymousUser'
)

AnonymousUserRef.implement({
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})

// Define the User union type to match api-users schema
export const UserRef = builder.unionType('User', {
  types: [AuthenticatedUserRef, AnonymousUserRef],
  resolveType: (user) => {
    // In practice, UserTeam members are always authenticated users
    // but the union type allows for both possibilities
    return 'AuthenticatedUser'
  }
})

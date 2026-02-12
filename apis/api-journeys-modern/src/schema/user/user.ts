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

// Define the User union type to match api-users schema
export const UserRef = builder.unionType('User', {
  types: [AuthenticatedUserRef],
  resolveType: (user) => {
    // In practice, UserTeam members are always authenticated users
    // but the union type allows for both possibilities
    return 'AuthenticatedUser'
  }
})

import { builder } from '../builder'

// Define the federated User type reference - this should only be defined once
export const UserRef = builder.externalRef(
  'User',
  builder.selection<{ id: string }>('id')
)

// Implement the external fields for the User type
UserRef.implement({
  externalFields: (t) => ({ id: t.id({ nullable: false }) }),
  fields: (t) => ({
    // No additional fields needed - this is just the external reference
  })
})

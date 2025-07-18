import { builder } from '../../builder'

// Define the role values as a const array for reuse
const USER_JOURNEY_ROLE_VALUES = ['inviteRequested', 'editor', 'owner'] as const

// Export the type for reuse
export type UserJourneyRoleType = (typeof USER_JOURNEY_ROLE_VALUES)[number]

// Create enum type for UserJourneyRole
export const UserJourneyRole = builder.enumType('UserJourneyRole', {
  values: USER_JOURNEY_ROLE_VALUES
})

// Shared classification logic used by both checkJourneysData and deleteJourneysData.
// Keeping it here avoids duplicating the "others" filter and role-based bucketing
// in two places that must stay in sync.

export type JourneyClassification = 'delete' | 'transfer' | 'remove'
export type TeamClassification = 'delete' | 'transfer' | 'remove'

interface UserJourneyLike {
  userId: string
  role: string
}

interface UserTeamLike {
  userId: string
  role: string
}

/**
 * Classify what should happen to a journey when its member is being deleted.
 *
 * - 'delete'   — user is the only accessor; journey must be deleted
 * - 'transfer' — user is owner and others exist; ownership must be transferred
 * - 'remove'   — user is a non-owner collaborator; just remove the membership
 */
export function classifyJourney(
  userId: string,
  userRole: string,
  allMembers: UserJourneyLike[]
): JourneyClassification {
  // Exclude inviteRequested — pending invites are not accepted collaborators
  // and must not be counted when deciding whether to transfer or delete.
  const others = allMembers.filter(
    (j) => j.userId !== userId && j.role !== 'inviteRequested'
  )
  if (others.length === 0) return 'delete'
  if (userRole === 'owner') return 'transfer'
  return 'remove'
}

/**
 * Classify what should happen to a team when its member is being deleted.
 *
 * - 'delete'   — user is the only member; team must be deleted
 * - 'transfer' — user is manager and others exist; manager role must be transferred
 * - 'remove'   — user is a non-manager member; just remove the membership
 */
export function classifyTeam(
  userId: string,
  userRole: string,
  allMembers: UserTeamLike[]
): TeamClassification {
  const others = allMembers.filter((t) => t.userId !== userId)
  if (others.length === 0) return 'delete'
  if (userRole === 'manager') return 'transfer'
  return 'remove'
}

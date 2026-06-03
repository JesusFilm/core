import { GraphQLError } from 'graphql'

import { prisma as journeysPrisma } from '@core/prisma/journeys/client'

/**
 * Throws FORBIDDEN if the user is not a member of the given team. Uses a uniform
 * error shape regardless of whether the team exists, so callers cannot probe for
 * team existence.
 */
export async function assertTeamMembership({
  teamId,
  userId
}: {
  teamId: string
  userId: string
}): Promise<void> {
  const membership = await journeysPrisma.userTeam.findUnique({
    where: { teamId_userId: { teamId, userId } }
  })

  if (membership == null)
    throw new GraphQLError('Not a member of this team', {
      extensions: { code: 'FORBIDDEN' }
    })
}

/**
 * Resolves the home team for an asset upload from the journey being edited.
 * Looks up the journey's teamId and verifies the caller is a member of that team
 * in a single query, returning the teamId. Throws NOT_FOUND if the journey does
 * not exist, FORBIDDEN if the caller is not a member of the journey's team.
 */
export async function resolveAuthorizedTeamId({
  journeyId,
  userId
}: {
  journeyId: string
  userId: string
}): Promise<string> {
  const journey = await journeysPrisma.journey.findUnique({
    where: { id: journeyId },
    select: {
      teamId: true,
      team: {
        select: { userTeams: { where: { userId }, select: { id: true } } }
      }
    }
  })

  if (journey == null)
    throw new GraphQLError('Journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })

  if (journey.team.userTeams.length === 0)
    throw new GraphQLError('Not a member of this team', {
      extensions: { code: 'FORBIDDEN' }
    })

  return journey.teamId
}

/**
 * Optionally resolves the home team for an upload. Returns null when no journeyId
 * is supplied (preserving v1 behavior). When a journeyId is supplied, an
 * authenticated user is required — throws FORBIDDEN otherwise — and the resolved
 * team is authorized via resolveAuthorizedTeamId.
 */
export async function maybeResolveTeamId({
  journeyId,
  userId
}: {
  journeyId?: string | null
  userId?: string | null
}): Promise<string | null> {
  if (journeyId == null) return null

  if (userId == null)
    throw new GraphQLError('journeyId requires an authenticated user', {
      extensions: { code: 'FORBIDDEN' }
    })

  return await resolveAuthorizedTeamId({ journeyId, userId })
}

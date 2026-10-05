import { GraphQLError } from 'graphql'

import { prisma as journeysPrisma } from '@core/prisma/journeys/client'

import { logger } from '../../logger'

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
 * in a single query, returning the teamId. Throws FORBIDDEN with a uniform shape
 * whether the journey is missing or the caller is not a member of its team, so
 * callers cannot probe journey existence by ID.
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

  if (journey == null || journey.team.userTeams.length === 0)
    throw new GraphQLError('Not a member of this team', {
      extensions: { code: 'FORBIDDEN' }
    })

  return journey.teamId
}

/**
 * Optionally resolves the home team for an upload. Returns null when no journeyId
 * is supplied (preserving v1 behavior). When a journeyId is supplied, an
 * authenticated user is required — throws FORBIDDEN otherwise, since a journeyId
 * is only meaningful for an authenticated caller.
 *
 * The team lookup itself is best-effort: team tagging must never block an asset
 * upload, so if resolveAuthorizedTeamId fails for any reason (journeys DB
 * unreachable, journey missing, or the caller is not a member of its team) we
 * log a warning and return null. The asset is still owned by the uploader via
 * userId; a null team only means it won't surface in the team-shared library.
 *
 * Note: this is the write/upload path. The read path (`getMyCloudflareImages`
 * with an explicit teamId) keeps its strict `assertTeamMembership` check, since
 * that guards against viewing another team's assets.
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

  try {
    return await resolveAuthorizedTeamId({ journeyId, userId })
  } catch (error) {
    logger.warn(
      { journeyId, userId, error },
      'failed to resolve team for asset upload; tagging as personal'
    )
    return null
  }
}

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
 * before returning it. Throws NOT_FOUND if the journey does not exist, FORBIDDEN
 * if the caller is not a member of the journey's team.
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
    select: { teamId: true }
  })

  if (journey == null)
    throw new GraphQLError('Journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })

  await assertTeamMembership({ teamId: journey.teamId, userId })

  return journey.teamId
}

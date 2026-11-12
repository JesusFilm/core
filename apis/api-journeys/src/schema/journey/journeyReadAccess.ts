import { createContextCache } from '@pothos/core'
import { GraphQLError } from 'graphql'

import { Journey as StoredJourney, prisma } from '@core/prisma/journeys/client'

import { Context } from '../authScopes'

import { Action, journeyAcl } from './journey.acl'

// Archived/trash/deleted URLs remain usable only after confirmed publication.
// A draft is private even when it used to be published.
export function isJourneyPublic(
  journey: Pick<StoredJourney, 'status' | 'firstPublishedAt'>
): boolean {
  return (
    journey.status === 'published' ||
    (journey.status !== 'draft' && journey.firstPublishedAt != null)
  )
}

// One authoritative read per journey in this HTTP operation. Pothos gives each
// operation a new context cache; no ACL decision survives into another request.
const readChecks = createContextCache(() => new Map<string, Promise<boolean>>())

export function canReadJourney(
  journeyId: string,
  context: Context
): Promise<boolean> {
  const checks = readChecks(context)
  const existing = checks.get(journeyId)
  if (existing != null) return existing
  const check = checkJourneyRead(journeyId, context)
  checks.set(journeyId, check)
  return check
}

async function checkJourneyRead(
  journeyId: string,
  context: Context
): Promise<boolean> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      userJourneys: true,
      team: { include: { userTeams: true } }
    }
  })
  if (journey == null) return false
  if (isJourneyPublic(journey)) return true
  // Preserve the publisher template visibility used by adminJourneys.
  if (
    context.type === 'authenticated' &&
    journey.template === true &&
    context.currentRoles.includes('publisher')
  ) {
    return true
  }
  return (
    context.type === 'authenticated' &&
    journeyAcl(Action.Read, journey, context.user)
  )
}

export async function requireJourneyRead(
  journeyId: string,
  context: Context
): Promise<void> {
  if (await canReadJourney(journeyId, context)) return
  throw new GraphQLError('journey not found', {
    extensions: { code: 'NOT_FOUND' }
  })
}

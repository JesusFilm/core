import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

export const journeyInclude = {
  userJourneys: true,
  team: { include: { userTeams: true } }
} as const

export type JourneyWithAcl = Prisma.JourneyGetPayload<{
  include: typeof journeyInclude
}>

export type JourneyIdentifierType = 'slug' | 'databaseId'

export function normalizeIdType(
  idType?: JourneyIdentifierType | null
): JourneyIdentifierType {
  return idType === 'databaseId' ? 'databaseId' : 'slug'
}

export async function loadJourneyOrThrow(
  id: string,
  idType: JourneyIdentifierType
): Promise<JourneyWithAcl> {
  const where = idType === 'slug' ? { slug: id } : { id }
  const journey = await prisma.journey.findUnique({
    where,
    include: journeyInclude
  })
  if (journey == null) {
    throw new GraphQLError('Journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }
  return journey
}

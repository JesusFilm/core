import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { getJourneyRealtimeVisitors } from './service'

const journeyInclude = {
  userJourneys: true,
  team: {
    include: { userTeams: true }
  }
} as const

type JourneyWithAcl = Prisma.JourneyGetPayload<{
  include: typeof journeyInclude
}>

type JourneyIdentifierType = 'slug' | 'databaseId'

function normalizeIdType(
  idType?: JourneyIdentifierType | null
): JourneyIdentifierType {
  return idType === 'databaseId' ? 'databaseId' : 'slug'
}

async function loadJourneyOrThrow(
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

builder.queryField('journeysPlausibleStatsRealtimeVisitors', (t) =>
  t.withAuth({ isAuthenticated: true }).int({
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        required: false,
        defaultValue: 'slug'
      })
    },
    resolve: async (_parent, { id, idType }, context) => {
      if (context.type !== 'authenticated') {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      const journey = await loadJourneyOrThrow(id, normalizeIdType(idType))

      if (!ability(Action.Update, subject('Journey', journey), context.user)) {
        throw new GraphQLError('User is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return getJourneyRealtimeVisitors(journey.id)
    }
  })
)

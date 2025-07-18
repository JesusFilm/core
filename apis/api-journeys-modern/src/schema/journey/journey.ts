import { prisma } from '@core/prisma-journeys/client'
import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { builder } from '../builder'
import { Language } from '../language'

import { Action, journeyAcl } from './journey.acl'
import { getSimpleJourney, updateSimpleJourney } from './simple'

// Define JourneyStatus enum to match api-journeys
builder.enumType('JourneyStatus', {
  values: ['archived', 'deleted', 'draft', 'published', 'trashed'] as const
})

export const JourneyRef = builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id', { shareable: true, nullable: false }),
    title: t.exposeString('title', {
      shareable: true,
      nullable: false,
      description: 'private title for creators'
    }),
    description: t.exposeString('description', {
      nullable: true,
      shareable: true
    }),
    slug: t.exposeString('slug', { shareable: true, nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      shareable: true,
      nullable: false
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      shareable: true,
      nullable: false
    }),
    status: t.field({
      type: 'JourneyStatus',
      nullable: false,
      shareable: true,
      resolve: (journey) => journey.status
    }),
    languageId: t.exposeString('languageId', {
      shareable: true,
      nullable: false
    }),
    language: t.field({
      type: Language,
      shareable: true,
      nullable: false,
      resolve: (journey) => ({ id: journey.languageId ?? '529' })
    }),
    blocks: t.relation('blocks', {
      shareable: true,
      nullable: true
    })
    // Add more fields as needed for federation compatibility
  })
})

// Register as a federated entity
builder.asEntity(JourneyRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (ref) => {
    return prisma.journey.findUnique({
      where: { id: ref.id }
    })
  }
})

builder.queryField('journeySimpleGet', (t) =>
  t.field({
    type: 'Json',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, { id }) => getSimpleJourney(id)
  })
)

builder.mutationField('journeySimpleUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Json',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      journey: t.arg({ type: 'Json', required: true })
    },
    resolve: async (_parent, { id, journey }, context) => {
      // 1. Fetch journey with ACL info
      const dbJourney = await prisma.journey.findUnique({
        where: { id },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })
      if (!dbJourney) throw new Error('Journey not found')

      // 2. Check ACL
      if (!journeyAcl(Action.Update, dbJourney, context.user)) {
        throw new Error('You do not have permission to update this journey')
      }

      // 3. Validate input
      const result = journeySimpleSchema.safeParse(journey)
      if (!result.success) {
        throw new Error(
          'Input journey data is invalid: ' +
            JSON.stringify(result.error.format())
        )
      }

      // 4. Update journey and blocks using the service
      await updateSimpleJourney(id, result.data)

      // 5. Return the updated journey in simple format
      return getSimpleJourney(id)
    }
  })
)

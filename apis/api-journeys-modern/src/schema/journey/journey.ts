import { journeySimpleSchema } from '@core/shared/ai/journeySimpleTypes'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { Language } from '../language'

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
    resolve: async (_parent, { id, journey }) => {
      // 1. Validate input
      const result = journeySimpleSchema.safeParse(journey)
      if (!result.success) {
        throw new Error(
          'Input journey data is invalid: ' +
            JSON.stringify(result.error.format())
        )
      }

      // 2. Update journey and blocks using the service
      await updateSimpleJourney(id, result.data)

      // 3. Return the updated journey in simple format
      return getSimpleJourney(id)
    }
  })
)

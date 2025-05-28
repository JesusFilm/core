import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Define JourneyStatus enum to match api-journeys
builder.enumType('JourneyStatus', {
  values: ['archived', 'deleted', 'draft', 'published', 'trashed'] as const
})

const JourneyRef = builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id', { shareable: true, nullable: false }),
    title: t.exposeString('title', { shareable: true, nullable: false }),
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
    languageId: t.exposeString('languageId', { shareable: true }),
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

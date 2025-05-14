import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Define JourneyStatus enum to match api-journeys
builder.enumType('JourneyStatus', {
  values: ['archived', 'deleted', 'draft', 'published', 'trashed'] as const,
})

const JourneyRef = builder.prismaObject('Journey', {
  fields: (t) => ({
    id: t.exposeID('id', { shareable: true }),
    title: t.exposeString('title', { shareable: true }),
    description: t.exposeString('description', { nullable: true, shareable: true }),
    slug: t.exposeString('slug', { shareable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', shareable: true }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', shareable: true }),
    status: t.field({
      type: 'JourneyStatus',
      shareable: true,
      resolve: (journey) => journey.status,
    }),
    languageId: t.exposeString('languageId', { shareable: true }),
    // Add more fields as needed for federation compatibility
  }),
})

// Register as a federated entity
builder.asEntity(JourneyRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async (ref) => {
    return prisma.journey.findUnique({
      where: { id: ref.id },
    })
  },
})

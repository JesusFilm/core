import { createEmbedding } from '../../lib/openai'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Type Definition
builder.prismaObject('Document', {
  fields: (t) => ({
    id: t.exposeID('id'),
    documentName: t.exposeString('documentName'),
    content: t.exposeString('content'),
    createdAt: t.expose('createdAt', { type: 'Date' }),
    updatedAt: t.expose('updatedAt', { type: 'Date' })
  })
})

// Queries
builder.queryField('documents', (t) =>
  t.prismaField({
    type: ['Document'],
    resolve: async (query) => {
      return prisma.document.findMany({
        ...query
      })
    }
  })
)

// Combined Mutations
builder.mutationFields((t) => ({
  createDocument: t.prismaField({
    type: 'Document',
    args: {
      documentName: t.arg.string({ required: true }),
      content: t.arg.string({ required: true })
    },
    resolve: async (query, _root, { documentName, content }) => {
      const embedding = await createEmbedding(content)

      return prisma.document.create({
        ...query,
        data: {
          documentName,
          content,
          embedding
        }
      })
    }
  }),
  deleteDocument: t.prismaField({
    type: 'Document',
    args: {
      id: t.arg.string({ required: true })
    },
    resolve: async (query, _root, { id }) => {
      return prisma.document.delete({
        ...query,
        where: { id }
      })
    }
  })
}))

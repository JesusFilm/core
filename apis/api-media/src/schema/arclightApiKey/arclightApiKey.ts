import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

const DefaultPlatform = builder.enumType('DefaultPlatform', {
  values: ['ios', 'android', 'web'] as const
})

const ArclightApiKeyObject = builder.prismaObject('ArclightApiKey', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    key: t.exposeString('key', { nullable: false }),
    desc: t.exposeString('desc', { nullable: true }),
    defaultPlatform: t.expose('defaultPlatform', {
      type: DefaultPlatform,
      nullable: false
    })
  })
})

builder.asEntity(ArclightApiKeyObject, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) => {
    const arclightApiKey = await prisma.arclightApiKey.findUnique({
      where: { id }
    })
    if (arclightApiKey == null) {
      throw new Error(`ArclightApiKey with id ${id} not found`)
    }
    return arclightApiKey
  }
})

builder.queryFields((t) => ({
  arclightApiKeys: t.prismaField({
    type: ['ArclightApiKey'],
    nullable: false,
    resolve: async (query) =>
      prisma.arclightApiKey.findMany({
        ...query
      })
  }),
  arclightApiKey: t.prismaField({
    type: 'ArclightApiKey',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) =>
      prisma.arclightApiKey.findUnique({
        ...query,
        where: { id }
      })
  })
}))

export { DefaultPlatform }

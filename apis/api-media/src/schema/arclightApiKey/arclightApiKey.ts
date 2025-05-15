import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

const DefaultPlatform = builder.enumType('DefaultPlatform', {
  values: ['ios', 'android', 'web'] as const
})

const ArclightApiKeyObject = builder.prismaObject('ArclightApiKey', {
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    desc: t.exposeString('desc', { nullable: true }),
    defaultPlatform: t.expose('defaultPlatform', {
      type: DefaultPlatform,
      nullable: false
    })
  })
})

builder.asEntity(ArclightApiKeyObject, {
  key: builder.selection<{ key: string }>('key'),
  resolveReference: async ({ key }) => {
    const arclightApiKey = await prisma.arclightApiKey.findUnique({
      where: { key }
    })
    if (arclightApiKey == null) {
      throw new Error(`ArclightApiKey with key ${key} not found`)
    }
    return arclightApiKey
  }
})

builder.queryFields((t) => ({
  arclightApiKeys: t.prismaField({
    type: [ArclightApiKeyObject],
    nullable: false,
    resolve: async (query) =>
      prisma.arclightApiKey.findMany({
        ...query
      })
  }),
  arclightApiKeyByKey: t.prismaField({
    type: ArclightApiKeyObject,
    nullable: true,
    args: {
      key: t.arg.string({ required: true })
    },
    resolve: async (query, _parent, { key }) =>
      prisma.arclightApiKey.findUnique({
        ...query,
        where: { key }
      })
  })
}))

export { DefaultPlatform }

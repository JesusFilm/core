import { builder } from '../builder'

export const Block = builder.prismaInterface('Block', {
  name: 'Block',
  directives: {
    key: { fields: 'id' }
  },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    journeyId: t.exposeID('journeyId', {
      nullable: false
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true
    })
  }),
  resolveType: (obj) => {
    return obj.typename
  }
})

// Input types for block operations
const BlocksFilter = builder.inputType('BlocksFilter', {
  fields: (t) => ({
    journeyIds: t.idList({ required: false }),
    typenames: t.stringList({ required: false })
  })
})

const BlockDuplicateIdMap = builder.inputType('BlockDuplicateIdMap', {
  fields: (t) => ({
    oldId: t.id({ required: true }),
    newId: t.id({ required: true })
  })
})

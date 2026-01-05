import { builder } from '../builder'
import { EventLabel } from '../enums'

export const Block = builder.prismaInterface('Block', {
  name: 'Block',
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
    }),
    eventLabel: t.expose('eventLabel', {
      type: EventLabel,
      nullable: true
    })
  }),
  resolveType: (obj) => {
    return obj.typename
  }
})

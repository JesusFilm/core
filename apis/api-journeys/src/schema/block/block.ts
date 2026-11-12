import { builder } from '../builder'
import { canReadJourney } from '../journey/journeyReadAccess'

export const Block = builder.prismaInterface('Block', {
  name: 'Block',
  authScopes: (block, context) => canReadJourney(block.journeyId, context),
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

import { Block } from '../../lib/types/block'
import { builder } from '../builder'

// Define Block interface type
const BlockRef = builder.interfaceRef<Block>('Block')
builder.interfaceType(BlockRef, {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    journeyId: t.exposeID('journeyId', { nullable: false }),
    typename: t.exposeString('typename'),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true
    })
  }),
  // Add federation key directive
  directives: { key: { fields: 'id' } },
  resolveType: (block) => {
    return block.typename
  }
})

export { BlockRef }

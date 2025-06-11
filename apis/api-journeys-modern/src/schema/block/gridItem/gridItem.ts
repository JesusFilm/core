import { builder } from '../../builder'
import { Block } from '../block'

export const GridItemBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'GridItemBlock',
  isTypeOf: (obj: any) => obj.typename === 'GridItemBlock',
  directives: { key: { fields: 'id' } },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', {
      nullable: false,
      directives: { shareable: true }
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    xl: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.xl ?? 12
    }),
    lg: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.lg ?? 12
    }),
    sm: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.sm ?? 12
    })
  })
})

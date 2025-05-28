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
    xl: t.exposeInt('xl', { nullable: true, directives: { shareable: true } }),
    lg: t.exposeInt('lg', { nullable: true, directives: { shareable: true } }),
    sm: t.exposeInt('sm', { nullable: true, directives: { shareable: true } })
  })
})

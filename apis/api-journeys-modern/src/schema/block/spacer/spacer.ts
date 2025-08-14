import { builder } from '../../builder'
import { Block } from '../block'

export const SpacerBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'SpacerBlock',
  isTypeOf: (obj: any) => obj.typename === 'SpacerBlock',
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
    spacing: t.exposeInt('spacing', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})

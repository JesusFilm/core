import { builder } from '../../builder'
import { Block } from '../block'

builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'StepBlock',
  isTypeOf: (obj: any) => obj.typename === 'StepBlock',
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
    locked: t.exposeBoolean('locked', {
      nullable: true,
      directives: { shareable: true }
    }),
    nextBlockId: t.exposeID('nextBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    x: t.exposeInt('x', { nullable: true, directives: { shareable: true } }),
    y: t.exposeInt('y', { nullable: true, directives: { shareable: true } }),
    slug: t.exposeString('slug', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})

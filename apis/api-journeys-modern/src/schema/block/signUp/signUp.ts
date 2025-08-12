import { builder } from '../../builder'
import { Block } from '../block'

builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'SignUpBlock',
  isTypeOf: (obj: any) => obj.typename === 'SignUpBlock',
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
    submitIconId: t.exposeID('submitIconId', {
      nullable: true,
      directives: { shareable: true }
    }),
    submitLabel: t.exposeString('submitLabel', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})

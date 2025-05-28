import { builder } from '../../builder'
import { Block } from '../block'

export const RadioOptionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioOptionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioOptionBlock',
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
    label: t.exposeString('label', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})

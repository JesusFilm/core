import { builder } from '../../builder'
import { Block } from '../block'

export const RadioQuestionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioQuestionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionBlock',
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
    gridView: t.exposeBoolean('gridView', {
      nullable: true,
      directives: { shareable: true }
    })
  })
})

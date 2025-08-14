import { builder } from '../../builder'
import { Block } from '../block'

export const RadioQuestionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'RadioQuestionBlock',
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionBlock',
  shareable: true,
  fields: (t) => ({
    gridView: t.exposeBoolean('gridView', {
      nullable: true
    })
  })
})

import { builder } from '../../builder'
import { Block } from '../block'

export const MultiselectBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectBlock',
  shareable: true,
  fields: (t) => ({
    selectMin: t.int({
      nullable: true,
      resolve: (block) => block.selectionLimit ?? null
    }),
    selectMax: t.int({
      nullable: true,
      resolve: (block) => block.selectionLimit ?? null
    }),
    submitText: t.exposeString('submitText', {
      nullable: false
    })
  })
})

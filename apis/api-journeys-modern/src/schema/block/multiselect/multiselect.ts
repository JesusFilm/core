import { builder } from '../../builder'
import { Block } from '../block'

export const MultiselectBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectBlock',
  shareable: true,
  fields: (t) => ({
    showSelection: t.boolean({
      nullable: false,
      resolve: (block) => block.showSelection ?? false
    }),
    selectMin: t.int({
      nullable: true,
      resolve: (block) => block.selectionLimit ?? null
    }),
    selectMax: t.int({
      nullable: true,
      resolve: (block) => block.selectionLimit ?? null
    }),
    showProgress: t.boolean({
      nullable: false,
      resolve: (block) => block.showProgress ?? false
    })
  })
})

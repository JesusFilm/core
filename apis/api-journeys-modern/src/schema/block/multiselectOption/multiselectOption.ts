import { builder } from '../../builder'
import { Block } from '../block'

export const MultiselectOptionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectOptionBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectOptionBlock',
  shareable: true,
  fields: (t) => ({
    label: t.string({
      nullable: false,
      resolve: (block) => block.label ?? ''
    })
  })
})

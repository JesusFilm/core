import { builder } from '../../builder'
import { Block } from '../block'

export const MultiselectBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectBlock',
  shareable: true,
  fields: (t) => ({
    label: t.string({
      nullable: false,
      resolve: (block) => block.label ?? ''
    }),
    min: t.exposeInt('min', { nullable: true }),
    max: t.exposeInt('max', { nullable: true }),
    action: t.relation('action', {
      nullable: true
    })
  })
})

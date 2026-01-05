import { builder } from '../../builder'
import { BlockEventLabel } from '../../enums'
import { Block } from '../block'

export const MultiselectOptionBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectOptionBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectOptionBlock',
  shareable: true,
  fields: (t) => ({
    eventLabel: t.expose('eventLabel', {
      type: BlockEventLabel,
      nullable: true
    }),
    label: t.string({ nullable: false, resolve: (block) => block.label ?? '' })
  })
})

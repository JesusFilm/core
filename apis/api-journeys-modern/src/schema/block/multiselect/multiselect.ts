import { builder } from '../../builder'
import { Block } from '../block'

export const MultiselectBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectBlock',
  shareable: true,
  fields: (t) => ({
    min: t.exposeInt('min', { nullable: true }),
    max: t.exposeInt('max', { nullable: true }),
    submitLabel: t.string({
      nullable: false,
      resolve: ({ submitLabel }) => submitLabel ?? ''
    })
  })
})

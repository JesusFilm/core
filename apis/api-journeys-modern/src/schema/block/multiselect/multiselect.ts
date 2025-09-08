import { builder } from '../../builder'
import { Block } from '../block'

export const MultiselectBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'MultiselectBlock',
  isTypeOf: (obj: any) => obj.typename === 'MultiselectBlock',
  shareable: true,
  fields: (t) => ({
    min: t.int({
      select: {
        min: true
      },
      nullable: true,
      resolve: (block) => block.min ?? null
    }),
    max: t.int({
      select: {
        max: true
      },
      nullable: true,
      resolve: (block) => block.max ?? null
    }),
    submitLabel: t.string({
      select: {
        submitLabel: true
      },
      nullable: false,
      resolve: ({ submitLabel }) => submitLabel ?? ''
    })
  })
})

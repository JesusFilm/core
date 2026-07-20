import { builder } from '../../builder'
import { Block } from '../block'

export const GridItemBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'GridItemBlock',
  isTypeOf: (obj: any) => obj.typename === 'GridItemBlock',
  shareable: true,
  fields: (t) => ({
    xl: t.int({
      nullable: false,
      resolve: (block) => block.xl ?? 12
    }),
    lg: t.int({
      nullable: false,
      resolve: (block) => block.lg ?? 12
    }),
    sm: t.int({
      nullable: false,
      resolve: (block) => block.sm ?? 12
    })
  })
})

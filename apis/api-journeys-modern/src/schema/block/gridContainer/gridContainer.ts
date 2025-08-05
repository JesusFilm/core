import { builder } from '../../builder'
import { Block } from '../block'

import { GridAlignItems, type GridAlignItemsType } from './enums/gridAlignItems'
import { GridDirection, type GridDirectionType } from './enums/gridDirection'
import {
  GridJustifyContent,
  type GridJustifyContentType
} from './enums/gridJustifyContent'

export const GridContainerBlock = builder.prismaObject('Block', {
  interfaces: [Block],
  variant: 'GridContainerBlock',
  isTypeOf: (obj: any) => obj.typename === 'GridContainerBlock',
  directives: { key: { fields: 'id' } },
  shareable: true,
  fields: (t) => ({
    gap: t.int({
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => block.gap ?? 0
    }),
    direction: t.field({
      type: GridDirection,
      nullable: false,
      directives: { shareable: true },
      resolve: (block) => (block.direction as GridDirectionType) ?? 'column'
    }),
    justifyContent: t.field({
      type: GridJustifyContent,
      nullable: false,
      directives: { shareable: true },
      resolve: (block) =>
        (block.justifyContent as GridJustifyContentType) ?? 'flexStart'
    }),
    alignItems: t.field({
      type: GridAlignItems,
      nullable: false,
      directives: { shareable: true },
      resolve: (block) =>
        (block.alignItems as GridAlignItemsType) ?? 'flexStart'
    })
  })
})

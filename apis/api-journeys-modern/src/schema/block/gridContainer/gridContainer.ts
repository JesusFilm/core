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
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false, directives: { shareable: true } }),
    journeyId: t.exposeID('journeyId', {
      nullable: false,
      directives: { shareable: true }
    }),
    parentBlockId: t.exposeID('parentBlockId', {
      nullable: true,
      directives: { shareable: true }
    }),
    parentOrder: t.exposeInt('parentOrder', {
      nullable: true,
      directives: { shareable: true }
    }),
    gap: t.exposeInt('gap', {
      nullable: true,
      directives: { shareable: true }
    }),
    direction: t.field({
      type: GridDirection,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.direction as GridDirectionType
    }),
    justifyContent: t.field({
      type: GridJustifyContent,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.justifyContent as GridJustifyContentType
    }),
    alignItems: t.field({
      type: GridAlignItems,
      nullable: true,
      directives: { shareable: true },
      resolve: (block) => block.alignItems as GridAlignItemsType
    })
  })
})

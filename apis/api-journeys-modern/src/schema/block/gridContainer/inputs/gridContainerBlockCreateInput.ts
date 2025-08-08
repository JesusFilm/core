import { builder } from '../../../builder'
import { GridAlignItems, GridDirection, GridJustifyContent } from '../enums'

export const GridContainerBlockCreateInput = builder.inputType(
  'GridContainerBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      gap: t.int({ required: false }),
      direction: t.field({ type: GridDirection, required: false }),
      justifyContent: t.field({ type: GridJustifyContent, required: false }),
      alignItems: t.field({ type: GridAlignItems, required: false })
    })
  }
)

import { builder } from '../../../builder'
import { GridAlignItems, GridDirection, GridJustifyContent } from '../enums'

export const GridContainerBlockUpdateInput = builder.inputType(
  'GridContainerBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      gap: t.int({ required: false }),
      direction: t.field({ type: GridDirection, required: false }),
      justifyContent: t.field({
        type: GridJustifyContent,
        required: false
      }),
      alignItems: t.field({ type: GridAlignItems, required: false })
    })
  }
)

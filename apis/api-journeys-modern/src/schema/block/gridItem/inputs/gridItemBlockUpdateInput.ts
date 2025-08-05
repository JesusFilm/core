import { builder } from '../../../builder'

export const GridItemBlockUpdateInput = builder.inputType(
  'GridItemBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      xl: t.int({ required: false }),
      lg: t.int({ required: false }),
      sm: t.int({ required: false })
    })
  }
)

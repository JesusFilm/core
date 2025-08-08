import { builder } from '../../../builder'

export const GridItemBlockCreateInput = builder.inputType(
  'GridItemBlockCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      journeyId: t.id({ required: true }),
      parentBlockId: t.id({ required: true }),
      xl: t.int({ required: false }),
      lg: t.int({ required: false }),
      sm: t.int({ required: false })
    })
  }
)

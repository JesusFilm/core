import { builder } from '../../builder'

export const BlockDuplicateIdMapInput = builder.inputType(
  'BlockDuplicateIdMap',
  {
    fields: (t) => ({
      oldId: t.id({ required: true }),
      newId: t.id({ required: true })
    })
  }
)

import { builder } from '../../builder'

export const JourneyVisitorExportSelect = builder.inputType(
  'JourneyVisitorExportSelect',
  {
    fields: (t) => ({
      name: t.boolean({ required: false }),
      email: t.boolean({ required: false }),
      phone: t.boolean({ required: false }),
      createdAt: t.boolean({ required: false })
    })
  }
)

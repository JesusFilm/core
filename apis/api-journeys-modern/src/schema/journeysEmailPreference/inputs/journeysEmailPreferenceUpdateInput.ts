import { builder } from '../../builder'

export const JourneysEmailPreferenceUpdateInput = builder.inputType(
  'JourneysEmailPreferenceUpdateInput',
  {
    fields: (t) => ({
      email: t.string({ required: true }),
      preference: t.string({ required: true }),
      value: t.boolean({ required: true })
    })
  }
)

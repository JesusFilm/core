import { builder } from '../../../builder'

export const MultiselectBlockSettingsInput = builder.inputType(
  'MultiselectBlockSettingsInput',
  {
    fields: (t) => ({
      displayResults: t.boolean({ required: false })
    })
  }
)

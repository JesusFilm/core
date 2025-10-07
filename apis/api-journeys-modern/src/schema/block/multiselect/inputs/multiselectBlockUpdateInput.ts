import { builder } from '../../../builder'
import { MultiselectBlockSettingsInput } from '../inputs/multiselectBlockSettingsInput'

export const MultiselectBlockUpdateInput = builder.inputType(
  'MultiselectBlockUpdateInput',
  {
    fields: (t) => ({
      parentBlockId: t.id({ required: false }),
      min: t.int({ required: false }),
      max: t.int({ required: false }),
      settings: t.field({
        type: MultiselectBlockSettingsInput,
        required: false
      })
    })
  }
)

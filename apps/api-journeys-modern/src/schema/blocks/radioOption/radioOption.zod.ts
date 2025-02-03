import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

// RadioOptionBlock schema with descriptions
const RadioOptionBlockSchema = BlockSchema.extend({
  label: z
    .string()
    .describe('The text label for the radio option, displayed to users'),
  action: ActionSchema.nullable().describe(
    'The action to be executed when the radio option is selected, if any'
  )
})

export { RadioOptionBlockSchema }

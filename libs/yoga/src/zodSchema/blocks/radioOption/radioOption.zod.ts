import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

// RadioOptionBlock schema with descriptions
const RadioOptionBlockSchema = BlockSchema.extend({
  typename: z
    .literal('RadioOptionBlock')
    .describe('This value must be "RadioOptionBlock".'),
  label: z
    .string()
    .describe('The text label for the radio option, displayed to users'),
  action: ActionSchema.nullable().describe(
    'The action to be executed when the radio option is selected, if any'
  ),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe(
      'This is the radio question id, which is the parent of this block.'
    )
})

export { RadioOptionBlockSchema }

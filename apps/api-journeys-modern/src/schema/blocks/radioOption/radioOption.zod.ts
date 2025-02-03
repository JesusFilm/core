import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'
// RadioOptionBlock schema
const RadioOptionBlockSchema = BlockSchema.extend({
  label: z.string(),
  action: ActionSchema.nullable()
})

export { RadioOptionBlockSchema }

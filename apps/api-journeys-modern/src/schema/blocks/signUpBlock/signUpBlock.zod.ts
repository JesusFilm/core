import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

const SignUpBlockSchema = BlockSchema.extend({
  action: ActionSchema,
  submitIconId: z.string().nullable(),
  submitLabel: z.string().nullable()
})

export { SignUpBlockSchema }

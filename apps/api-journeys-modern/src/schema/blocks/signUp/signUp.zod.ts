import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

const SignUpBlockSchema = BlockSchema.extend({
  action: ActionSchema.describe('An action associated with the sign-up block'),
  submitIconId: z
    .string()
    .nullable()
    .describe('An optional ID for the submit icon'),
  submitLabel: z
    .string()
    .nullable()
    .describe('An optional label for the submit button')
})

export { SignUpBlockSchema }

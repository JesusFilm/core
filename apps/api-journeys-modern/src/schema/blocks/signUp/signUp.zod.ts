import { z } from 'zod'

import { ActionSchema } from '../action/action.zod'
import { BlockSchema } from '../blocks.zod'

const SignUpBlockSchema = BlockSchema.extend({
  typename: z
    .literal('SignUpBlock')
    .describe('This value must be "SignUpBlock".'),
  action: ActionSchema.nullable().describe(
    'An action associated with the sign-up block'
  ),
  submitIconId: z
    .string()
    .nullable()
    .describe('An optional ID for the submit icon'),
  submitLabel: z
    .string()
    .nullable()
    .describe('An optional label for the submit button'),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe('This is the CardBlock id, which is the parent of this block.')
})

export { SignUpBlockSchema }

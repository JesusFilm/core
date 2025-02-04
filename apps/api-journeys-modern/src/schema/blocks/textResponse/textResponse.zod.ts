import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const TextResponseTypeSchema = z
  .enum(['freeForm', 'name', 'email'])
  .describe(
    'The type of response expected, such as free form text, name, or email.'
  )

const TextResponseBlockSchema = BlockSchema.extend({
  typename: z
    .literal('TextResponseBlock')
    .describe('This value must be "TextResponseBlock".'),
  label: z.string().describe('The label for the text response block.'),
  hint: z
    .string()
    .nullable()
    .describe('An optional hint or placeholder for the text input.'),
  minRows: z
    .number()
    .nullable()
    .describe('Minimum number of rows to display for the input field.'),
  type: TextResponseTypeSchema.nullable().describe(
    'Specifies the expected type of text input.'
  ),
  routeId: z
    .string()
    .nullable()
    .describe('Optional routing identifier for text response integration.'),
  integrationId: z
    .string()
    .nullable()
    .describe('Optional integration identifier for external linking.'),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe('This is the CardBlock id, which is the parent of this block.')
}).describe('Schema for a TextResponse block.')

export { TextResponseBlockSchema, TextResponseTypeSchema }

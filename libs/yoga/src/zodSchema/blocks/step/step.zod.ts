import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const StepBlockSchema = BlockSchema.extend({
  typename: z.literal('StepBlock').describe('This value must be "StepBlock".'),
  nextBlockId: z
    .string()
    .uuid()
    .describe('The ID of the next block in the journey.')
    .nullable()
    .describe(
      'Contains the ID of the next StepBlock to navigate to. This cannot be null unless it is the last step in the journey.'
    ),
  locked: z
    .boolean()
    .describe(
      'Indicates if the step is locked, preventing manual advancement.'
    ),
  x: z
    .number()
    .nullable()
    .describe('Horizontal position of the block in the journey flow diagram.'),
  y: z
    .number()
    .nullable()
    .describe('Vertical position of the block in the journey flow diagram.'),
  slug: z
    .string()
    .nullable()
    .describe('Unique identifier for the block, used if not null.')
}).describe('Schema for a Step block.')

export { StepBlockSchema }

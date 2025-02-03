import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const StepBlockSchema = BlockSchema.extend({
  nextBlockId: z
    .string()
    .nullable()
    .describe('Contains the ID of the preferred next block to navigate to.'),
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

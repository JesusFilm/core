import { z } from 'zod'

import { BlockFields_StepBlock } from '../../../../../../__generated__/BlockFields'
import {
  StepBlockCreateInput,
  StepBlockUpdateInput
} from '../../../../../../__generated__/globalTypes'
import { blockSchema } from '../type'

export const blockStepSchema = blockSchema.extend({
  __typename: z.literal('StepBlock'),
  nextBlockId: z
    .string()
    .nullable()
    .describe(
      'ID of the next block (Step block only). This controls which step the user will be redirected to after completing the current step by default.'
    ),
  x: z
    .number()
    .nullable()
    .optional()
    .describe(
      'Horizontal position in the editor diagram. You should try position this block to the right of the previous block without overlapping other blocks. Should be at least 400 more than the previous block.'
    ),
  y: z
    .number()
    .nullable()
    .optional()
    .describe(
      'Vertical position in the editor diagram. You should try position this block to the left of the card block without overlapping other blocks. Should be at least 200 more than the previous block.'
    ),
  locked: z
    .boolean()
    .describe('Whether the step is locked. This is not used anymore.'),
  slug: z
    .string()
    .nullable()
    .describe(
      'Slug for the step. Allows for the step to be navigated to by a URL.'
    ),
  parentBlockId: z.null()
}) satisfies z.ZodType<BlockFields_StepBlock>

export const blockStepCreateInputSchema = blockStepSchema
  .pick({
    id: true,
    journeyId: true,
    x: true,
    y: true
  })
  .merge(
    z.object({
      nextBlockId: z
        .string()
        .optional()
        .nullable()
        .describe(
          'ID of the next block (Step block only). This controls which step the user will be redirected to after completing the current step by default. You must only use ids of other step blocks that already exist in the journey. If it does not exist, you should first create the step block and then use the step update tool to come back and update this block.'
        )
    })
  ) satisfies z.ZodType<StepBlockCreateInput>

export const blockStepUpdateInputSchema = z.object({
  nextBlockId: z
    .string()
    .nullable()
    .optional()
    .describe(
      'ID of the next block (Step block only). This controls which step the user will be redirected to after completing the current step by default.'
    ),
  locked: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the step is locked. This is not used anymore.'),
  x: z
    .number()
    .nullable()
    .optional()
    .describe(
      'Horizontal position in the editor diagram. You should try position this block to the right of the previous block without overlapping other blocks. Should be at least 400 more than the previous block.'
    ),
  y: z
    .number()
    .nullable()
    .optional()
    .describe(
      'Vertical position in the editor diagram. You should try position this block to the left of the card block without overlapping other blocks. Should be at least 200 more than the previous block.'
    ),
  slug: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Slug for the step. Allows for the step to be navigated to by a URL.'
    )
}) satisfies z.ZodType<StepBlockUpdateInput>

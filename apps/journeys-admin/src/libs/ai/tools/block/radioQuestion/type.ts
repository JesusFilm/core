import { z } from 'zod'

import { BlockFields_RadioQuestionBlock } from '../../../../../../__generated__/BlockFields'
import { RadioQuestionBlockCreateInput } from '../../../../../../__generated__/globalTypes'
import { blockSchema } from '../type'

export const blockRadioQuestionSchema = blockSchema.extend({
  __typename: z.literal('RadioQuestionBlock')
}) satisfies z.ZodType<BlockFields_RadioQuestionBlock>

export const blockRadioQuestionCreateInputSchema = z.object({
  id: z
    .string()
    .optional()
    .describe('Optional ID for the new radio question block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z
    .string()
    .describe('ID of the parent block. The parent block must be a card block!')
}) satisfies z.ZodType<RadioQuestionBlockCreateInput>

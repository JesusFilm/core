import { z } from 'zod'

import { BlockFields_RadioOptionBlock } from '../../../../../../__generated__/BlockFields'
import {
  RadioOptionBlockCreateInput,
  RadioOptionBlockUpdateInput
} from '../../../../../../__generated__/globalTypes'
import { actionSchema } from '../action/type'
import { blockSchema } from '../type'

export const blockRadioOptionSchema = blockSchema.extend({
  __typename: z.literal('RadioOptionBlock'),
  label: z.string().describe('Label of the radio option block'),
  action: actionSchema.nullable()
}) satisfies z.ZodType<BlockFields_RadioOptionBlock>

export const blockRadioOptionCreateInputSchema = z.object({
  id: z.string().optional().describe('Optional ID for the new block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z.string().describe('ID of the parent block'),
  label: z.string().describe('Label of the radio option block')
}) satisfies z.ZodType<RadioOptionBlockCreateInput>

export const blockRadioOptionUpdateInputSchema = z.object({
  parentBlockId: z.string().optional().describe('ID of the parent block'),
  label: z.string().optional().describe('Label of the radio option block')
}) satisfies z.ZodType<RadioOptionBlockUpdateInput>

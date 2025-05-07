import { z } from 'zod'

import { actionSchema } from '../../action/type'
import { blockSchema } from '../type'

export const blockRadioOptionSchema = blockSchema.extend({
  id: z.string().describe('Unique identifier for the block'),
  __typename: z.literal('RadioOptionBlock'),
  parentOrder: z.number().int().describe('Order of the radio option block'),
  parentBlockId: z.string().optional().describe('ID of the parent block'),
  label: z.string().describe('Label of the radio option block'),
  action: actionSchema.optional()
})

export const blockRadioOptionCreateInputSchema = z.object({
  id: z.string().optional().describe('Optional ID for the new block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z.string().describe('ID of the parent block'),
  label: z.string().describe('Label of the radio option block')
})

export const blockRadioOptionUpdateInputSchema = z.object({
  parentBlockId: z.string().optional().describe('ID of the parent block'),
  label: z.string().optional().describe('Label of the radio option block')
})

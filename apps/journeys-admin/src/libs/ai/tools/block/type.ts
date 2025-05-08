import { z } from 'zod'

export const blockSchema = z.object({
  id: z.string().describe('Unique identifier for the block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z
    .string()
    .nullable()
    .describe('ID of the parent block, if any'),
  parentOrder: z
    .number()
    .int()
    .nullable()
    .describe('Order position within the parent block')
})

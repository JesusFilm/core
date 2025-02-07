import { z } from 'zod'

const BlockSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe('The unique identifier for the block. This must be a uuid.'),
  journeyId: z
    .string()
    .uuid()
    .describe('A uuid for the journey that this block belongs to'),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe('The id of the parent block'),
  parentOrder: z
    .number()
    .nullable()
    .describe(
      'The order of the parent block, deterines which order the block appears in the UI'
    )
})

export { BlockSchema }

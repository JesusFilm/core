import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const RadioQuestionBlockSchema = BlockSchema.extend({
  typename: z
    .literal('RadioQuestionBlock')
    .describe('This value has to be "RadioQuestionBlock"'),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe('This block can only be a child of a step block')
})

export { RadioQuestionBlockSchema }

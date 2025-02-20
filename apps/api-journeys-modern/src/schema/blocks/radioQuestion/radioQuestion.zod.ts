import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const RadioQuestionBlockSchema = BlockSchema.extend({
  typename: z
    .literal('RadioQuestionBlock')
    .describe('This value must be "RadioQuestionBlock".'),
  parentBlockId: z
    .string()
    .uuid()
    .nullable()
    .describe('This is the CardBlock id, which is the parent of this block.')
})

export { RadioQuestionBlockSchema }

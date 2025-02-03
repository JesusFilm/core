import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const StepBlockSchema = BlockSchema.extend({
  nextBlockId: z.string().nullable(),
  locked: z.boolean(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  slug: z.string().nullable()
})

export { StepBlockSchema }

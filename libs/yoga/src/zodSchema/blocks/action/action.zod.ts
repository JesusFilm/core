import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const ActionSchema = z.object({
  parentBlockId: z.string(),
  parentBlock: BlockSchema,
  gtmEventName: z.string().nullable()
})

export { ActionSchema }

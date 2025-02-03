import { z } from 'zod'

import { BlockSchema } from '../blocks.zod'

const TextResponseTypeSchema = z.enum(['freeForm', 'name', 'email'])

// TextResponseBlock schema
const TextResponseBlockSchema = BlockSchema.extend({
  label: z.string(),
  hint: z.string().nullable(),
  minRows: z.number().nullable(),
  type: TextResponseTypeSchema.nullable(),
  routeId: z.string().nullable(),
  integrationId: z.string().nullable()
})

export { TextResponseBlockSchema, TextResponseTypeSchema }

import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  enabled: z.boolean().optional()
})

export const AgentApiKeyUpdateInput = builder.inputType(
  'LuminaAgentApiKeyUpdateInput',
  {
    fields: (t) => ({
      name: t.string({ required: false }),
      enabled: t.boolean({ required: false })
    }),
    validate: {
      schema
    }
  }
)

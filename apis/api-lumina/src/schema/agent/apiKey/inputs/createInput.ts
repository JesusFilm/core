import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  agentId: z.string().uuid('Agent ID must be a valid UUID'),
  name: z.string().min(1, 'Name is required'),
  enabled: z.boolean()
})

export const AgentApiKeyCreateInput = builder.inputType(
  'LuminaAgentApiKeyCreateInput',
  {
    fields: (t) => ({
      agentId: t.id({ required: true }),
      name: t.string({ required: true }),
      enabled: t.boolean({ required: true })
    }),
    validate: {
      schema
    }
  }
)

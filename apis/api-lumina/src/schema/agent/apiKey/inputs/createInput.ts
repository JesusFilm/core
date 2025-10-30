import { z } from 'zod'

import { builder } from '../../../builder'

const schema = z.object({
  agentId: z.string().uuid('Agent ID must be a valid UUID'),
  name: z.string().min(1, 'Name is required')
})

export const AgentApiKeyCreateInput = builder.inputType(
  'LuminaAgentApiKeyCreateInput',
  {
    fields: (t) => ({
      agentId: t.id({ required: true }),
      name: t.string({ required: true })
    }),
    validate: {
      schema
    }
  }
)
